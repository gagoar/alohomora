
import AWS, { SharedIniFileCredentials } from 'aws-sdk/global';
export type CredentialsOptions = Partial<Credentials & ProfileCredentials>
type ProfileCredentials = { profile: string };
type Credentials = {
  accessKeyId: string,
  secretAccessKey: string,
  sessionToken?: string,
};

const isProfileCredentials = (credentials: CredentialsOptions | null): credentials is ProfileCredentials => {
  return credentials && 'profile' in credentials || false;
}
const isAccessKeyCredentials = (credentials: CredentialsOptions | null): credentials is Credentials => {
  return credentials?.accessKeyId && credentials?.secretAccessKey && true || false;
}


export const setAWSCredentials = (credentialsOptions: CredentialsOptions | null) => {
  if (!credentialsOptions) {
    return;
  }

  if (isProfileCredentials(credentialsOptions)) {
    AWS.config.credentials = new SharedIniFileCredentials({ profile: credentialsOptions.profile });
    return;
  }

  if (isAccessKeyCredentials(credentialsOptions)) {
    AWS.config.credentials = credentialsOptions;
  }
};