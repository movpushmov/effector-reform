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
      const { issues } = e as ZodError;

      return issues.reduce((acc: ErrorsSchemaPayload, issue) => {
        if (acc[issue.path.join('.')]) {
          return acc;
        }

        acc[issue.path.join('.')] = issue.message;

        return acc;
      }, {});
    }
  };
}
