import SSM from 'aws-sdk/clients/ssm';
import dateFormat from 'dateformat';
import { DATE_FORMAT } from './constants';

export const normalizeSecretKey = (key: string, prefix: string): { environment: string, name: string } => {
  const [, environment, name] = key.replace(`/${prefix}`, '').split('/');
  return { environment, name };
};

const getUser = (lastModifiedUser: string): string => {
  return lastModifiedUser.split('user/')[1];
};

export enum MetadataList {
  name,
  environment,
  user,
  date
};
export const normalizeSecrets = (prefix: string, parameters: SSM.ParameterMetadataList): string[][] => {
  const keys = parameters.map(({ Name = '', LastModifiedDate = '', LastModifiedUser = '' }) => {
    const { name, environment } = normalizeSecretKey(Name, prefix);
    const date = dateFormat(LastModifiedDate, DATE_FORMAT);
    return [name, environment, getUser(LastModifiedUser), date];
  });

  keys.sort((a, b) => {
    if (a[MetadataList.name] > b[MetadataList.name]) return 1;
    if (a[MetadataList.name] < b[MetadataList.name]) return -1;
    return 0;
  });

  return keys;
}