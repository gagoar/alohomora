
import AWS, { SharedIniFileCredentials } from 'aws-sdk/global';
import { isProfileCredentials, isAccessKeyCredentials } from './guards';

export type CredentialsOptions = Partial<Credentials & ProfileCredentials>
export type ProfileCredentials = { profile: string };
export type Credentials = {
  accessKeyId: string,
  secretAccessKey: string,
  sessionToken?: string,
};

export const setAWSCredentials = (credentialsOptions: CredentialsOptions | null) => {
  if (isProfileCredentials(credentialsOptions)) {
    AWS.config.credentials = new SharedIniFileCredentials({ profile: credentialsOptions.profile });
    return;
  }

  if (isAccessKeyCredentials(credentialsOptions)) {
    AWS.config.credentials = credentialsOptions;
  }

  return;
};
