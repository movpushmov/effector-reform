import { ArrayFieldPathApi, FormApi, PrimitiveFieldPathApi } from '../mapper';

export function getArrayFieldApi(
  formApi: FormApi,
  path: string,
): ArrayFieldPathApi {
  const api = formApi[path];

  if (!api) {
    throw new Error(`unknown field with path ${path}`);
  }

  if (api.type !== 'array-field') {
    throw new Error(
      `expected field type "array-field", received "${api.type}"`,
    );
  }

  return api;
}

export function getPrimitiveFieldApi(
  formApi: FormApi,
  path: string,
): PrimitiveFieldPathApi {
  const api = formApi[path];

  if (!api) {
    throw new Error(`unknown field with path ${path}`);
  }

  if (api.type !== 'primitive-field') {
    throw new Error(
      `expected field type "primitive-field", received "${api.type}"`,
    );
  }

  return api;
}
