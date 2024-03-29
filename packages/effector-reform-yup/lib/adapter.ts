import type {
  FormValues,
  ErrorsSchemaPayload,
  AsyncValidationFn,
  AnySchema,
} from '@effector-reform/core';
import type { AnySchema as AnyYupSchema, ValidationError } from 'yup';

function preparePath(path: string) {
  return path.replace(/\[/g, '.').replace(/]/g, '');
}

export function yupAdapter<Schema extends AnySchema>(
  schema: AnyYupSchema,
): AsyncValidationFn<Schema> {
  return async (
    values: FormValues<any>,
  ): Promise<ErrorsSchemaPayload | null> => {
    try {
      await schema.validate(values, { strict: true, abortEarly: false });

      return null;
    } catch (e) {
      const errors = e as ValidationError;

      return errors.inner.reduce((acc: ErrorsSchemaPayload, error) => {
        acc[preparePath(error.path!)] = error.message;

        return acc;
      }, {});
    }
  };
}
