import SSM from 'aws-sdk/clients/ssm';
import groupBy from 'lodash.groupby';

import { Options } from "../types";
import { REGION, API_VERSION, MAX_RESULTS_FOR_PATH, Environment } from '../utils/constants';
import { normalizeSecretKey } from '../utils/normalizeSecretKey';
interface Input extends Options { templateName?: string, custom?: string };

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

  const secretPairs = parameters.map(({ Name = '', Value: value = '' }) => {

    const { name, environment } = normalizeSecretKey(Name, prefix);
    return {
      name,
      environment,
      value,
    }
  });
  return groupBy(secretPairs, ({ environment }: { environment: string }) => environment);
}
export const exportAsTemplate = async ({ prefix, environment = Environment.all, region = REGION }: Input): Promise<string> => {

  try {
    const groupedSecrets = await getKeys({
      prefix,
      region,
    });

    const baseSecrets = groupedSecrets[Environment.all].reduce(((memo, secret) => {
      return Object.keys(memo).length ? { ...memo, [secret.name]: secret.value } : { [secret.name]: secret.value };
    }), {} as Record<string, string>);;

    if (environment !== Environment.all && environment in groupedSecrets) {
      const envSecrets: Record<string, string> = groupedSecrets[environment].reduce(((memo, secret) => {
        return { ...memo, [secret.name]: secret.value };
      }));

      return JSON.stringify({ ...baseSecrets, ...envSecrets }, null, 2);
    } else {
      return JSON.stringify(baseSecrets, null, 2);
    }
  } catch (e) {
    console.error('something went awfully wrong', e);
    throw e;
  }
};
