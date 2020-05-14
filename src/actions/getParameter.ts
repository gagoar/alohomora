import SSM from 'aws-sdk/clients/ssm';
import { AWSError } from 'aws-sdk/lib/core';
import dateFormat from 'dateformat'
import Table from 'cli-table3';
import ora from 'ora';

import { Options } from '../types';
import { REGION, API_VERSION, Environment, DATE_FORMAT, SUCCESS_SYMBOL } from '../utils/constants';
import { getGlobalOptions, Command } from '../utils/getGlobalOptions';
import { setAWSCredentials } from '../utils/setAWSCredentials';


interface Input extends Options {
  name: string
};

export const getParameter = async ({ name, prefix, region = REGION, environment = Environment.all }: Input): Promise<string> => {

  const loader = ora(`retrieving key ${name} with the prefix /${prefix}  (${region})`).start();

  const ssm = new SSM({ apiVersion: API_VERSION, region });
  const params = {
    Name: `/${prefix}/${environment}/${name}`,
    WithDecryption: true
  };

  const table = new Table({
    head: ['Name', 'Value', 'Environment', 'Updated by', 'Version']
  });


  let response: SSM.GetParameterResult;

  try {
    response = await ssm.getParameter(params).promise();

    if (response.Parameter) {

      const { Value: value, LastModifiedDate: updatedAt, Version: version } = response.Parameter;

      table.push([name, value, environment, dateFormat(updatedAt, DATE_FORMAT), version]);

      loader.stopAndPersist({ text: `${name} found under /${prefix}  (${region})`, symbol: SUCCESS_SYMBOL });
      return table.toString();

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

  const { params, credentials } = getGlobalOptions(command);

  setAWSCredentials(credentials);
  const response = await getParameter({ ...params, name });
  console.log(response);
}