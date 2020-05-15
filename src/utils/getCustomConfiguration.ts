import { cosmiconfig } from 'cosmiconfig';
import { SUCCESS_SYMBOL } from './constants';
import { isObject } from 'util';
import ora from 'ora';
import packageJSON from '../../package.json';


enum ConfigOptions {
  prefix = 'prefix',
  region = 'region'
}
export type CustomConfig = Partial<Record<ConfigOptions, string>>;


const isConfig = (config: CustomConfig | undefined): config is CustomConfig => {
  if (config && isObject(config)) {
    const validKeys = Object.keys(config).some(key => Object.keys(ConfigOptions).includes(key));
    const validValues = Object.values(config).every(key => typeof key === 'string');
    return validKeys && validValues;

  } else {
    return false;
  }

}
export const getCustomConfiguration = async (): Promise<CustomConfig | void> => {
  const loader = ora('Loading available Configuration').start();

  try {
    const explorer = cosmiconfig(packageJSON.name);
    const result = await explorer.search();
    if (result?.config && isConfig(result.config)) {
      loader.stopAndPersist({ text: `Custom configuration found in ${result.filepath}`, symbol: SUCCESS_SYMBOL });
      return result.config;
    } else {
      loader.stopAndPersist({ text: 'No custom Configuration configuration found', symbol: SUCCESS_SYMBOL });
    }
  } catch (e) {
    loader.fail('We encounter an error looking for custom configuration, we will use cli options');
  }
}

