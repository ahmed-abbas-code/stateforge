// packages/shared/utils/getFrameworkConfig.ts

import { getServerFrameworkConfig } from './getServerFrameworkConfig';
import { getClientFrameworkConfig } from './getClientFrameworkConfig';

export function getFrameworkConfig() {
  if (typeof window === 'undefined') {
    return getServerFrameworkConfig();
  } else {
    return getClientFrameworkConfig();
  }
}
