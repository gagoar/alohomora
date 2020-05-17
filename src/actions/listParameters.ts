import Table, { HorizontalAlignment } from 'cli-table3';
import colors from 'colors/safe';
import dateFormat from 'dateformat';
import ora from 'ora';
import SSM from 'aws-sdk/clients/ssm';

import { Actions } from '../types';
import { API_VERSION, REGION, DATE_FORMAT, SUCCESS_SYMBOL, MAX_RESULTS_FOR_DESCRIBE, DISABLE_TABLE_COLORS } from '../utils/constants';
import { normalizeSecretKey } from '../utils/normalizeSecretKey';
import { Command, getGlobalOptions } from '../utils/getGlobalOptions';
import { setAWSCredentials } from '../utils/setAWSCredentials';
import group from 'lodash.groupby';

const getUser = (lastModifiedUser: string): string => {
  return lastModifiedUser.split('user/')[1];
}

const describeParameters = async (params: SSM.DescribeParametersRequest, region: string): Promise<SSM.ParameterMetadataList> => {
  const ssm = new SSM({ apiVersion: API_VERSION, region });
  const { Parameters: parameters = [], NextToken } = await ssm.describeParameters(params).promise();

  if (NextToken) {
    const moreParameters = await describeParameters({ ...params, NextToken }, region);
    return [...parameters, ...moreParameters];
  } else {
    return parameters;
  }
}

enum GroupBy {
  name = 'name',
  environment = 'environment'
}
interface Input extends Actions {
  groupBy?: keyof typeof GroupBy
}


const HEADERS: Record<keyof typeof GroupBy, string[]> = {
  'environment': ['Name', 'Updated by', 'Updated at'],
  'name': ['Environment', 'Updated by', 'Updated at']
}

const getTableHeader = (groupBy: Input['groupBy']) => {
  if (!groupBy) {
    return ['Name', 'Environment', 'Updated by', 'Updated at'];
  }

  return HEADERS[groupBy];
}

type TableContent = Table.HorizontalTableRow | Table.VerticalTableRow | Table.CrossTableRow;
const createTable = (head: Table.TableOptions['head'] | undefined, content: TableContent[], style?: Table.TableConstructorOptions['style']) => {

  const table = new Table({
    head,
    style
  });

  table.push(...content);
  return table;
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
    parameters = await describeParameters(params, region);
    const keys = parameters.map(({ Name = '', LastModifiedDate = '', LastModifiedUser = '' }) => {
      const { name, environment } = normalizeSecretKey(Name, prefix);
      const date = dateFormat(LastModifiedDate, DATE_FORMAT);
      return [name, environment, getUser(LastModifiedUser), date];
    });

    keys.sort((a, b) => {
      if (a[0] > b[0]) return 1;
      if (a[0] < b[0]) return -1;
      return 0;
    })

    const styles = ci ? DISABLE_TABLE_COLORS : undefined;

    if (!groupBy) {
      const table = createTable(getTableHeader(groupBy), keys, styles);
      content.push(table.toString());
    } else {
      const groups = group(keys, tuple => groupBy === GroupBy.name ? tuple[0] : tuple[1]);

      const finalGroups = Object.keys(groups).map(group => {
        const values = groups[group].map(tuple =>
          groupBy === GroupBy.name ? [tuple[1], tuple[2], tuple[3]] : [tuple[0], tuple[2], tuple[3]]
        );

        const label = `${GroupBy[groupBy]}: ${group}`;

        const groupByLabel = [{ colSpan: 3, hAlign: 'center' as HorizontalAlignment, content: ci ? label : colors.red(label) }];
        const header = ci ? getTableHeader(groupBy) : getTableHeader(groupBy).map(value => colors.red(value));

        const table = createTable(undefined, [groupByLabel, header, ...values], styles);

        return table.toString();
      });
      content.push(...finalGroups);
    }

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