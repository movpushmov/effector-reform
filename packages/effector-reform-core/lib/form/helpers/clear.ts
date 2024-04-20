import type { FormApi } from '../mapper';

export function clearFormErrors(formApi: FormApi, mode: 'inner' | 'outer') {
  for (const apiKey in formApi) {
    const api = formApi[apiKey];

    if (mode === 'inner') {
      api.clearInnerError();
    } else if (mode === 'outer') {
      api.clearOuterError();
    }
  }
}

export function fullFormClear(formApi: FormApi) {
  for (const apiKey in formApi) {
    const api = formApi[apiKey];

    api.clear(true);
  }
}
