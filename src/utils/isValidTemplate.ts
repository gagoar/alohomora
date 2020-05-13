import { Template } from './constants';
export const isValidTemplate = (env: string): env is Template => {
  return env in Template;
}