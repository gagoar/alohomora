import SSM from 'aws-sdk/clients/ssm';
import { AWSError } from 'aws-sdk/lib/core';
import ora from 'ora';

import { Options } from '../types';
import { REGION, API_VERSION, Environment, SUCCESS_SYMBOL } from '../utils/constants';
import { getGlobalOptions, Command } from '../utils/getGlobalOptions';
import { setAWSCredentials } from '../utils/setAWSCredentials';


interface Input extends Options {
  name: string;

};

export const deleteParameter = async ({ name, prefix, region = REGION, environment = Environment.all }: Input): Promise<void> => {

  const loader = ora(`deleting key ${name} with prefix /${prefix} (${region})`).start();

  const ssm = new SSM({ apiVersion: API_VERSION, region });

  const keyName = `/${prefix}/${environment}/${name}`;

  const params = {
    Name: keyName,
  }

  try {
    await ssm.deleteParameter(params).promise();
    loader.stopAndPersist({ text: `deleted ${keyName} (${region})`, symbol: SUCCESS_SYMBOL });
  } catch (e) {
    if ((e as AWSError).code === 'ParameterNotFound') {
      loader.stopAndPersist({ text: `parameter ${keyName} not found (${region})`, symbol: SUCCESS_SYMBOL });
    } else {
      loader.fail(`Something went wrong deleting the key ${keyName}, ${e}`);
    }
  }
}


export const command = async (name: string, command: Command): Promise<void> => {

  const { params, credentials } = getGlobalOptions(command);

  setAWSCredentials(credentials);
  await deleteParameter({ ...params, name });
}