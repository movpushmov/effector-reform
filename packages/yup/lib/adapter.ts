import type {
  FormErrors,
  FormValues,
  PartialRecursive,
  ReadyFieldsGroupSchema,
  AsyncValidationFn,
} from '@effector-reform/core';
import type { AnySchema, ValidationError } from 'yup';

function prepareErrors(errors: { message: string; path: string }[]) {
  const result = {};

  function createSubObjects(node: any, path: string[], message: string) {
    const key = path.shift();

    if (!key) {
      return;
    }

    if (path.length === 0) {
      node[key] = message;
      return;
    }

    if (/\w+\[\d+\]/.test(key)) {
      const parsed = key.split('[');

      const subKey = parsed[0];
      const index = parseInt(parsed[1].replace(']', ''));

      node[subKey] = [];

      for (let i = 0; i < index + 1; i++) {
        node[subKey].push({});
      }

      return createSubObjects(node[subKey][index], [...path], message);
    }

    node[key] = {};
    return createSubObjects(node[key], [...path], message);
  }

  for (const error of errors) {
    createSubObjects(result, error.path.split('.'), error.message);
  }

  return result;
}

export function yupAdapter<FormSchema extends ReadyFieldsGroupSchema>(
  schema: AnySchema,
): AsyncValidationFn<FormSchema> {
  return async (
    values: FormValues<FormSchema>,
  ): Promise<PartialRecursive<FormErrors<FormSchema>> | null> => {
    try {
      await schema.validate(values, { strict: true, abortEarly: false });

      return null;
    } catch (e) {
      const error = e as ValidationError;
      const errors = error.inner.map((err) => ({
        message: err.message,
        path: err.path!,
      }));

      return prepareErrors(errors);
    }
  };
}
