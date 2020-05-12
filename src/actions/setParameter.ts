import SSM from 'aws-sdk/clients/ssm';
import dateFormat from 'dateformat'
import Table from 'cli-table3';
import ora from 'ora';

import { Options } from '../types';
import { REGION, API_VERSION, Environment, DATE_FORMAT, SUCCESS_SYMBOL } from '../utils/constants';


interface Input extends Options {
  name: string;
  value: string;

  description?: string;
};

export const setParameter = async ({ name, value, description, prefix, region = REGION, environment = Environment.all }: Input): Promise<string> => {

  const loader = ora(`storing key ${name} with the prefix /${prefix}  (${region})`).start();

  const ssm = new SSM({ apiVersion: API_VERSION, region });

  const keyName = `/${prefix}/${environment}/${name}`;

  const params = {
    Name: keyName,
    Value: value,
    DataType: 'text',
    Description: description,
    Overwrite: true,
    Type: 'SecureString'
  }

  const table = new Table({
    head: ['Name', 'Value', 'Environment', 'Updated by', 'Version']
  });

  let response;
  try {
    response = await ssm.putParameter(params).promise();

    table.push([name, value, environment, dateFormat(Date.now(), DATE_FORMAT), response.Version]);

    loader.stopAndPersist({ text: `stored ${name}, under /${prefix}  (${region})`, symbol: SUCCESS_SYMBOL });
  } catch (e) {
    loader.fail(`Something went wrong storing the key ${e}`);
  }

  return response ? table.toString() : '';
}