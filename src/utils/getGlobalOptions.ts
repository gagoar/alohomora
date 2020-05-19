import { CustomConfig, getCustomConfiguration } from './getCustomConfiguration';

interface Options { ci?: boolean, prefix?: string, awsProfile?: string, environment?: string, awsRegion?: string, awsAccessKeyId?: string, awsSecretAccessKey?: string, awsSessionToken?: string }
type PossibleCredentials = { profile?: string, accessKeyId?: string, secretAccessKey?: string, sessionToken?: string };
type Parameters = { prefix: string, region?: string, environment?: string, ci?: boolean };
export interface Command { parent: Options };

const getOptionsFromCommand = (command: Command): [PossibleCredentials, Partial<Parameters>] => {
  const {
    parent:
    {
      environment,
      prefix,
      awsRegion: region,
      awsProfile: profile,
      awsAccessKeyId: accessKeyId,
      awsSecretAccessKey: secretAccessKey,
      awsSessionToken: sessionToken,
      ci = false
    }
  } = command

  const credentials = { profile, accessKeyId, secretAccessKey, sessionToken };

  return [credentials, { environment, prefix, region, ci }]
}
export const getGlobalOptions = async (command: Command): Promise<{ params: Parameters, credentials: PossibleCredentials }> => {
  let customConfiguration: CustomConfig | void

  const [credentials, parameters] = getOptionsFromCommand(command);

  if (!parameters.prefix) {
    customConfiguration = await getCustomConfiguration();

    if (customConfiguration && 'prefix' in customConfiguration && typeof customConfiguration.prefix === 'string') {
      const { prefix: customPrefix, ...rest } = customConfiguration;
      return {
        credentials,
        params: { prefix: customPrefix, ...rest }
      }
    } else {
      console.error('prefix not provided, try again with --prefix option');
      process.exit(1);
    }
  } else {
    return {
      credentials,
      params: parameters as Parameters
    }
  }
}
