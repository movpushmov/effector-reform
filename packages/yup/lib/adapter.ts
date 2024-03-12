import type {
  FormErrors,
  FormValues,
  PartialRecursive,
  ReadyFieldsGroupSchema,
  ErrorsSchemaPayload,
  AsyncValidationFn,
} from '@effector-reform/core';
import type { AnySchema, ValidationError } from 'yup';

function preparePath(path: string) {
  return path.replace(/\[/g, '.').replace(/]/g, '');
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
      const errors = e as ValidationError;

      return errors.inner.reduce((acc: ErrorsSchemaPayload, error) => {
        acc[preparePath(error.path!)] = error.message;

        return acc;
      }, {});
    }
  };
}
