import { HorizontalAlignment, TableConstructorOptions } from 'cli-table3';
import colors from 'colors/safe';
import ora from 'ora';
import SSM from 'aws-sdk/clients/ssm';
import group from 'lodash.groupby';

import { Actions } from '../types';
import { API_VERSION, REGION, SUCCESS_SYMBOL, MAX_RESULTS_FOR_DESCRIBE, DISABLE_TABLE_COLORS, GroupBy } from '../utils/constants';
import { normalizeSecrets, MetadataList } from '../utils/normalizeSecrets';
import { Command, getGlobalOptions } from '../utils/getGlobalOptions';
import { setAWSCredentials } from '../utils/setAWSCredentials';
import { createTable, getTableHeader } from '../utils/tables';
import { paginateAWSCall } from '../utils/paginateAWSCall';

interface Input extends Actions {
  groupBy?: keyof typeof GroupBy
}


const valuesByGroup = (values: string[][], groupBy: keyof typeof GroupBy) => {
  return values.map(tuple =>
    groupBy === GroupBy.name
      ? [tuple[MetadataList.environment], tuple[MetadataList.user], tuple[MetadataList.date]]
      : [tuple[MetadataList.name], tuple[MetadataList.user], tuple[MetadataList.date]]
  );
};

const normalizeGroups = (groups: Record<string, string[][]>, groupBy: keyof typeof GroupBy, ci: boolean, styles?: TableConstructorOptions['style']) => {
  return Object.keys(groups).map(group => {
    const values = valuesByGroup(groups[group], groupBy);

    const label = `${GroupBy[groupBy]}: ${group}`;

    const groupByLabel = [{ colSpan: 3, hAlign: 'center' as HorizontalAlignment, content: ci ? label : colors.red(label) }];
    const header = ci ? getTableHeader(groupBy) : getTableHeader(groupBy).map(value => colors.red(value));

    const table = createTable(undefined, [groupByLabel, header, ...values], styles);

    return table.toString();
  });
};

const listByGroup = (keys: string[][], groupBy: keyof typeof GroupBy, ci: boolean, styles?: TableConstructorOptions['style']) => {
  const groups = group(keys, tuple => groupBy === GroupBy.name ? tuple[MetadataList.name] : tuple[MetadataList.environment]);
  return normalizeGroups(groups, groupBy, ci, styles);
}

export const listParameters = async ({ environment, prefix, region = REGION, ci = false, groupBy }: Input): Promise<string> => {
  const content = [];
  const loader = ora(`Finding keys with the prefix /${prefix}  (${region})`).start();

  const path = environment ? `/${prefix}/${environment}/` : `/${prefix}`;

  const parameterFilters = [
    {
      Key: 'Name',
      Option: 'Contains',
      Values: [path]
    }
  ]

  const params = {
    MaxResults: MAX_RESULTS_FOR_DESCRIBE,
    ParameterFilters: parameterFilters,
  };

  let parameters: SSM.ParameterMetadataList = [];

  try {

    const ssm = new SSM({ apiVersion: API_VERSION, region });

    parameters = await paginateAWSCall<
      SSM.DescribeParametersRequest,
      SSM.DescribeParametersResult,
      SSM.ParameterMetadata>(params, ssm.describeParameters.bind(ssm));

    const keys = normalizeSecrets(prefix, parameters);

    const styles = ci ? DISABLE_TABLE_COLORS : undefined;

    let tuples: string[];
    if (!groupBy) {
      tuples = [createTable(getTableHeader(groupBy), keys, styles).toString()];
    } else {
      tuples = [...listByGroup(keys, groupBy, ci, styles)];
    }

    content.push(...tuples);

    loader.stopAndPersist({ text: `found ${parameters.length} secrets, under /${prefix}  (${region})`, symbol: SUCCESS_SYMBOL });
  } catch (e) {
    loader.fail(`we found an error: ${e}`);
  }

  return parameters.length ? content.join('\n') : '';
}

const isValidGroupBy = (groupBy: string | undefined): groupBy is keyof typeof GroupBy | undefined => {
  return groupBy === undefined || Object.keys(GroupBy).includes(groupBy);
};

interface CommandList extends Command {
  groupBy?: string
};

export const command = async (command: CommandList): Promise<void> => {

  if (!isValidGroupBy(command.groupBy)) {
    console.error(`groupBy is no valid, please try ${Object.keys(GroupBy).join(' | ')}`);
    process.exit(1);
  }

  const { params, credentials } = await getGlobalOptions(command);

  setAWSCredentials(credentials);

  const response = await listParameters({ ...params, groupBy: command.groupBy });

  console.log(response);
};