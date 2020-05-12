import Table from 'cli-table3';
import dateFormat from 'dateformat';
import ora from 'ora';
import SSM from 'aws-sdk/clients/ssm';

import { Options } from '../types';
import { API_VERSION, MAX_RESULTS, REGION, DATE_FORMAT, SUCCESS_SYMBOL } from '../utils/constants';
import { normalizeSecretKey } from '../utils/normalizeSecretKey';


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

export const listParameters = async ({ environment, prefix, region = REGION }: Options): Promise<string> => {

  const loader = ora(`Finding keys with the prefix /${prefix}  (${region})`).start();

  const table = new Table({
    head: ['Name', 'Environment', 'Updated by', 'Updated at']
  });

  const path = environment ? `/${prefix}/${environment}/` : `/${prefix}`;

  const parameterFilters = [
    {
      Key: 'Name',
      Option: 'Contains',
      Values: [path]
    }
  ]

  const params = {
    MaxResults: MAX_RESULTS,
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
      if (a[0] > b[0]) return -1;
      return 0;
    })

    table.push(...keys);

    loader.stopAndPersist({ text: `found ${parameters.length} secrets, under /${prefix}  (${region})`, symbol: SUCCESS_SYMBOL });
  } catch (e) {
    loader.fail(`we found an error: ${e}`);
  }

  return parameters.length ? table.toString() : '';
}
