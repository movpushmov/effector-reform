import type {
  AnySchema,
  AsyncValidationFn,
  ErrorsSchemaPayload,
} from '@effector-reform/core';
import { parseAsync } from 'zod/v4/core';
import { isZodV4Schema, ZodAnyError, ZodAnyType } from './utils';

export function zodAdapter<Schema extends AnySchema>(
  schema: ZodAnyType,
): AsyncValidationFn<Schema> {
  return async (values): Promise<ErrorsSchemaPayload | null> => {
    try {
      if (isZodV4Schema(schema)) await parseAsync(schema, values);
      else await schema.parseAsync(values);

      return null;
    } catch (e) {
      const { issues } = e as ZodAnyError;

      return issues.reduce((acc: ErrorsSchemaPayload, error) => {
        if (acc[error.path.join('.')]) {
          return acc;
        }

        acc[error.path.join('.')] = error.message;

        return acc;
      }, {});
    }
  };
}
