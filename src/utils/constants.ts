export const API_VERSION = '2014-11-06';
export const REGION = 'us-east-1';
export const MAX_RESULTS_FOR_DESCRIBE = 50;
export const MAX_RESULTS_FOR_PATH = 10;
export const DATE_FORMAT = 'dddd, mmmm dS, yyyy, h:MM:ss TT (Z)';

export const SUCCESS_SYMBOL = '💫';

export enum Environment {
  development = 'development',
  production = 'production',
  staging = 'staging',
  test = 'test',
  all = 'all'
}

export enum Template {
  shell = 'shell',
  json = 'json',

}

export const DISABLE_TABLE_COLORS = {
  head: []    //disable colors in header cells
  , border: []  //disable colors for the border
} 