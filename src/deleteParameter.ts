import SSM from 'aws-sdk/clients/ssm';
import ora from 'ora';

import { Options } from './types';
import { REGION, API_VERSION, Environment, SUCCESS_SYMBOL } from './constants';


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
    loader.fail(`Something went wrong deleting the key ${keyName}, ${e}`);
  }
}