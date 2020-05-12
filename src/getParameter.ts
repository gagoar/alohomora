import SSM from 'aws-sdk/clients/ssm';
import dateFormat from 'dateformat'
import Table from 'cli-table3';

import { Options } from './types';
import { REGION, API_VERSION, Environment, DATE_FORMAT } from './constants';


interface GetParameterInput extends Options {
  name: string
};

export const getParameter = async ({ name, prefix, region = REGION, environment = Environment.all }: GetParameterInput): Promise<string> => {

  const ssm = new SSM({ apiVersion: API_VERSION, region });
  const params = {
    Name: `/${prefix}/${environment}/${name}`,
    WithDecryption: true
  };

  const table = new Table({
    head: ['Name', 'Value', 'Environment', 'Updated by', 'Version']
  });


  try {
    const { Parameter: parameter } = await ssm.getParameter(params).promise();

    if (parameter) {

      const { Value: value, LastModifiedDate: updatedAt, Version: version } = parameter;

      table.push([name, value, environment, dateFormat(updatedAt, DATE_FORMAT), version]);
    } else {
      console.info(`the key ${name} was not found`);
    }

  } catch (e) {
    console.error('something went wrong obtaining key', e);
  }
  return table.toString();
}