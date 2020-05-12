import { Environment } from '../constants';
export const isValidEnvironment = (env: string): env is Environment => {
  return env in Environment;
}