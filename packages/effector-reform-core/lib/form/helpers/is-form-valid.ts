import { FormApi } from '../mapper';

export function isFormValid(api: FormApi) {
  let isValid = true;

  for (const key in api) {
    const fieldApi = api[key];

    if (!fieldApi.isValid) {
      isValid = false;
      break;
    }
  }

  return isValid;
}
