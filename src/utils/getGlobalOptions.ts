interface Options { prefix: string, awsProfile?: string, environment?: string, awsRegion?: string, awsAccessKeyId?: string, awsSecretAccessKey?: string, awsSessionToken?: string }
type PossibleCredentials = { profile?: string, accessKeyId?: string, secretAccessKey?: string, sessionToken?: string };
type Parameters = { prefix: string, region?: string, environment?: string }
export interface Command { parent: Options }
export const getGlobalOptions = (command: Command): { params: Parameters, credentials: PossibleCredentials } => {
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

  return {
    credentials: { profile, accessKeyId, secretAccessKey, sessionToken },
    params: { prefix, region, environment }
  }
}