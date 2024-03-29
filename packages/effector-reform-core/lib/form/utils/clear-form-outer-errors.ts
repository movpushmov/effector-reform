import type { FormApi } from './types';

export function clearFormOuterErrors(formApi: FormApi) {
  for (const apiKey in formApi) {
    const api = formApi[apiKey];

    api.clearOuterError();
  }
}
