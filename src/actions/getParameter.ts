import SSM from 'aws-sdk/clients/ssm';
import { AWSError } from 'aws-sdk/lib/core';
import dateFormat from 'dateformat'
import ora from 'ora';

import { Actions } from '../types';
import { REGION, API_VERSION, Environment, DATE_FORMAT, SUCCESS_SYMBOL, DISABLE_TABLE_COLORS } from '../utils/constants';
import { getGlobalOptions, Command } from '../utils/getGlobalOptions';
import { setAWSCredentials } from '../utils/setAWSCredentials';
import { createTable } from '../utils/tables';

const customHeader = ['Name', 'Value', 'Environment', 'Updated by', 'Version'];
interface Input extends Actions {
  name: string
};

const getTupleFromParameter = (name: string, environment: string, { Value: value, LastModifiedDate: updatedAt, Version: version }: SSM.Parameter) => [[name, value, environment, dateFormat(updatedAt, DATE_FORMAT), version]];
export const getParameter = async ({ name, prefix, region = REGION, ci = false, environment = Environment.all }: Input): Promise<string> => {

  const loader = ora(`retrieving key ${name} with the prefix /${prefix}  (${region})`).start();

  const ssm = new SSM({ apiVersion: API_VERSION, region });

  const params = {
    Name: `/${prefix}/${environment}/${name}`,
    WithDecryption: true
  };

  let response: SSM.GetParameterResult;

  try {
    response = await ssm.getParameter(params).promise();

    if (response.Parameter) {

      const style = ci ? DISABLE_TABLE_COLORS : undefined;
      const content = createTable(customHeader, getTupleFromParameter(name, environment, response.Parameter), style);

      loader.stopAndPersist({ text: `${name} found under /${prefix}  (${region})`, symbol: SUCCESS_SYMBOL });

      return content.toString();

    } else {
      loader.stopAndPersist({ text: `${name} not found under /${prefix}  (${region})`, symbol: SUCCESS_SYMBOL });
    }

  } catch (e) {
    if ((e as AWSError).code === 'ParameterNotFound') {
      loader.stopAndPersist({ text: `${name} not found under /${prefix}  (${region})`, symbol: SUCCESS_SYMBOL });
    } else {
      loader.fail(`something went wrong retrieving the key ${name}, ${e}`);
    }
  }

  return '';
}

export const command = async (name: string, command: Command): Promise<void> => {

  const { params, credentials } = await getGlobalOptions(command);

  setAWSCredentials(credentials);
  const response = await getParameter({ ...params, name });
  console.log(response);
}