import SSM from 'aws-sdk/clients/ssm';
import dateFormat from 'dateformat'
import Table from 'cli-table3';
import ora from 'ora';

import { Actions } from '../types';
import { REGION, API_VERSION, Environment, DATE_FORMAT, SUCCESS_SYMBOL, DISABLE_TABLE_COLORS } from '../utils/constants';
import { getGlobalOptions, Command } from '../utils/getGlobalOptions';
import { setAWSCredentials } from '../utils/setAWSCredentials';


interface Input extends Actions {
  name: string;
  value: string;

  description?: string;
};

export const setParameter = async ({ name, value, description, prefix, region = REGION, ci = false, environment = Environment.all }: Input): Promise<string> => {

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
    head: ['Name', 'Value', 'Environment', 'Updated at', 'Version'],
    style: ci ? DISABLE_TABLE_COLORS : undefined
  });

  let response: SSM.PutParameterResult | undefined;
  try {
    response = await ssm.putParameter(params).promise();

    table.push([name, value, environment, dateFormat(Date.now(), DATE_FORMAT), response.Version]);

    loader.stopAndPersist({ text: `stored ${name}, under /${prefix}  (${region})`, symbol: SUCCESS_SYMBOL });
  } catch (e) {
    loader.fail(`Something went wrong storing the key ${e}`);
  }

  return response ? table.toString() : '';
}


export const command = async (name: string, value: string, description: string | undefined, command: Command): Promise<void> => {

  const { params, credentials } = await getGlobalOptions(command);

  setAWSCredentials(credentials);
  const response = await setParameter({ ...params, name, value, description: description });
  console.log(response);
}