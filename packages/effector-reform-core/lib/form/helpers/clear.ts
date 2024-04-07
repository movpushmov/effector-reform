import type { FormApi } from '../mapper';

export function clearFormOuterErrors(formApi: FormApi) {
  for (const apiKey in formApi) {
    const api = formApi[apiKey];

    api.clearOuterError();
  }
}

export function fullFormClear(formApi: FormApi) {
  for (const apiKey in formApi) {
    const api = formApi[apiKey];

    api.clear(true);
  }
}
