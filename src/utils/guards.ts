import { Template } from './constants';
import { CredentialsOptions, ProfileCredentials, Credentials } from './setAWSCredentials';

export const isValidTemplate = (env: string): env is Template => {
  return env in Template;
}

export const isProfileCredentials = (credentials: CredentialsOptions | null): credentials is ProfileCredentials => {
  return credentials?.profile && true || false;
}
export const isAccessKeyCredentials = (credentials: CredentialsOptions | null): credentials is Credentials => {
  return credentials?.accessKeyId && credentials?.secretAccessKey && true || false;
}