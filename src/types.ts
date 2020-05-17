
import { Environment } from './utils/constants';

export interface Actions { environment?: Environment | string, prefix: string, region?: string, ci?: boolean };