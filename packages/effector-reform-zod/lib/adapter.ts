import type {
  AnySchema,
  AsyncValidationFn,
  ErrorsSchemaPayload,
} from '@effector-reform/core';
import { ZodType, ZodError } from 'zod';
import { ZodError as Zod3Error } from 'zod/v3';

export function zodAdapter<Schema extends AnySchema>(
  schema: ZodType<any, any, any>,
): AsyncValidationFn<Schema> {
  return async (values): Promise<ErrorsSchemaPayload | null> => {
    try {
      await schema.parseAsync(values);

      return null;
    } catch (e: unknown) {
      if (typeof e !== 'object' || e === null) throw e;

      const issues = (() => {
        if ('issues' in e) {
          const { issues } = e as ZodError;

          return issues;
        } else if ('errors' in e) {
          const { errors } = e as Zod3Error;

          return errors;
        } else {
          return null;
        }
      })();

      if (!issues) throw e;

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
