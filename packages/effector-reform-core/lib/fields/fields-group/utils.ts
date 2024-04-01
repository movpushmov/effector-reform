import {
  arrayFieldSymbol,
  createArrayField,
  isArrayField,
} from '../array-field';
import {
  PrimaryValue,
  createField,
  isPrimaryField,
  isPrimaryValue,
  primaryFieldSymbol,
} from '../primary-field';
import type {
  AnySchema,
  ReadyFieldsGroupSchema,
  UserFormSchema,
} from './types';

export function prepareFieldsSchema<
  T extends AnySchema | PrimaryValue,
  U = UserFormSchema<T>,
>(schema: T): U {
  const result: UserFormSchema<any> = {};

  if (isPrimaryValue(schema)) {
    return schema as U;
  }

  for (const key in schema) {
    const element = schema[key];

    if (isPrimaryValue(element)) {
      result[key] = createField(element);
      continue;
    }

    if (isPrimaryField(element) || isArrayField(element)) {
      result[key] = element;
      continue;
    }

    if (Array.isArray(element)) {
      result[key] = createArrayField(element);
      continue;
    }

    if (typeof element === 'object') {
      result[key] = prepareFieldsSchema(element as ReadyFieldsGroupSchema);
    }
  }

  return result;
}

export function forkGroup<T extends ReadyFieldsGroupSchema>(group: T): T {
  const result: UserFormSchema<any> = {};

  for (const key in group) {
    const element = group[key];

    switch (element.type) {
      case arrayFieldSymbol:
      case primaryFieldSymbol: {
        result[key] = element.forkOnCreateForm ? element.fork() : element;

        break;
      }
      case undefined: {
        result[key] = forkGroup(element);

        break;
      }
    }
  }

  return result;
}
