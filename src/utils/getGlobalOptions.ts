import { CustomConfig, getCustomConfiguration } from './getCustomConfiguration';

interface Options { prefix?: string, awsProfile?: string, environment?: string, awsRegion?: string, awsAccessKeyId?: string, awsSecretAccessKey?: string, awsSessionToken?: string }
type PossibleCredentials = { profile?: string, accessKeyId?: string, secretAccessKey?: string, sessionToken?: string };
type Parameters = { prefix: string, region?: string, environment?: string }
export interface Command { parent: Options }
export const getGlobalOptions = async (command: Command): Promise<{ params: Parameters, credentials: PossibleCredentials }> => {
  let customConfiguration: CustomConfig | void
  const {
    parent:
    {
      environment,
      prefix,
      awsRegion: region,
      awsProfile: profile,
      awsAccessKeyId: accessKeyId,
      awsSecretAccessKey: secretAccessKey,
      awsSessionToken: sessionToken
    }
  } = command

  const credentials = { profile, accessKeyId, secretAccessKey, sessionToken };
  let params: Parameters;

  if (!prefix) {
    customConfiguration = await getCustomConfiguration();

    if (customConfiguration && 'prefix' in customConfiguration && typeof customConfiguration.prefix === 'string') {
      const { prefix: customPrefix, ...rest } = customConfiguration;
      params = { prefix: customPrefix, ...rest };
    } else {
      console.error('prefix not provided, try again with --prefix option');
      process.exit(1);
    }
  } else {
    params = { prefix, environment, region }
  }

  return {
    credentials,
    params
  }

}