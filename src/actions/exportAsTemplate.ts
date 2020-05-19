import SSM from 'aws-sdk/clients/ssm';
import groupBy from 'lodash.groupby';

import { Actions } from '../types';
import { REGION, API_VERSION, MAX_RESULTS_FOR_PATH, Environment, Template } from '../utils/constants';
import { normalizeSecretKey } from '../utils/normalizeSecrets';
import { isValidTemplate } from '../utils/guards';
import { getGlobalOptions, Command } from '../utils/getGlobalOptions';
import { setAWSCredentials } from '../utils/setAWSCredentials';
interface Input extends Actions { templateName?: Template, custom?: string };

const getParametersByPath = async (params: SSM.GetParametersByPathRequest, region: string): Promise<SSM.ParameterList> => {

  const ssm = new SSM({ apiVersion: API_VERSION, region });
  const { Parameters: parameters = [], NextToken } = await ssm.getParametersByPath(params).promise();

  if (NextToken) {
    const moreParameters = await getParametersByPath({ ...params, NextToken }, region);
    return [...parameters, ...moreParameters];
  } else {
    return parameters;
  }
}

const getKeys = async ({ prefix, region }: { prefix: string, region: string }) => {
  const parameters = await getParametersByPath({
    Path: `/${prefix}`,
    MaxResults: MAX_RESULTS_FOR_PATH,
    Recursive: true,
    WithDecryption: true,
  }, region);

  const secrets = parameters.map(({ Name = '', Value: value = '' }) => {

    const { name, environment } = normalizeSecretKey(Name, prefix);
    return {
      name,
      environment,
      value,
    }
  });

  return groupBy(secrets, ({ environment }: { environment: string }) => environment);
}
const templateFunctions = {
  [Template.shell]: (secrets: Record<string, string>): string => {
    return Object.keys(secrets).map(key => `export ${key}='${secrets[key]}'`).join('\n');
  },
  [Template.json]: (secrets: Record<string, string>): string => {
    return JSON.stringify(secrets, null, 2);
  },
}

type Keys = { name: string; environment: string; value: string; };

const normalizeGroup = (keys: Keys[]): Record<string, string> => {
  return keys.reduce(((memo, secret) => {
    return Object.keys(memo).length ? { ...memo, [secret.name]: secret.value } : { [secret.name]: secret.value };
  }), {} as Record<string, string>);
};

export const exportAsTemplate = async ({ prefix, environment = Environment.all, region = REGION, templateName = Template.shell }: Input): Promise<string> => {

  try {
    const groupedSecrets = await getKeys({
      prefix,
      region,
    });

    let secrets: Record<string, string>;
    const baseSecrets = normalizeGroup(groupedSecrets[Environment.all] || []);

    if (environment !== Environment.all && environment in groupedSecrets) {
      const envSecrets = normalizeGroup(groupedSecrets[environment]);

      secrets = { ...baseSecrets, ...envSecrets };
    } else {
      secrets = baseSecrets;
    }

    return templateFunctions[templateName](secrets);

  } catch (e) {
    console.error('We found an error trying to retrieve secrets', e);
    throw e;
  }
};

export const command = async (templateName: string = Template.shell, command: Command): Promise<void> => {

  if (isValidTemplate(templateName)) {
    const { params, credentials } = await getGlobalOptions(command);

    setAWSCredentials(credentials);
    const response = await exportAsTemplate({ ...params, templateName });
    console.log(response);
  } else {
    console.error(`please provide a valid templateName (${Template})`);
    process.exit(1)
  }

}
