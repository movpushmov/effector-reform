import type {
  FormValues,
  ReadyFieldsGroupSchema,
  AsyncValidationFn,
  ErrorsSchemaPayload,
} from '@effector-reform/core';
import type { ZodRawShape, ZodError, ZodObject } from 'zod';

export function zodAdapter<FormSchema extends ReadyFieldsGroupSchema>(
  schema: ZodObject<ZodRawShape>,
): AsyncValidationFn<FormSchema> {
  return async (
    values: FormValues<FormSchema>,
  ): Promise<ErrorsSchemaPayload> => {
    try {
      await schema.parseAsync(values);

      return {};
    } catch (e) {
      const { errors } = e as ZodError;

      return errors.reduce((acc: ErrorsSchemaPayload, error) => {
        acc[error.path.join('.')] = error.message;

        return acc;
      }, {});
    }
  };
}
