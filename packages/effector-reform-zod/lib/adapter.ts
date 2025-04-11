import type {
  AnySchema,
  AsyncValidationFn,
  ErrorsSchemaPayload,
} from '@effector-reform/core';
import { ZodError, ZodType } from 'zod';

export function zodAdapter<Schema extends AnySchema>(
  schema: ZodType<any, any, any>,
): AsyncValidationFn<Schema> {
  return async (values): Promise<ErrorsSchemaPayload | null> => {
    try {
      await schema.parseAsync(values);

      return null;
    } catch (e) {
      const { errors } = e as ZodError;

      return errors.reduce((acc: ErrorsSchemaPayload, error) => {
        if (acc[error.path.join('.')]) {
          return acc;
        }

        acc[error.path.join('.')] = error.message;

        return acc;
      }, {});
    }
  };
}
