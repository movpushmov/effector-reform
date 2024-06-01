import {
  arrayFieldSymbol,
  createArrayField,
  isArrayField,
} from '../array-field';
import {
  PrimitiveValue,
  createField,
  isPrimitiveField,
  isPrimitiveValue,
  primitiveFieldSymbol,
} from '../primitive-field';
import type {
  AnySchema,
  ReadyFieldsGroupSchema,
  UserFormSchema,
} from './types';

export function prepareFieldsSchema<
  T extends AnySchema | PrimitiveValue,
  U = UserFormSchema<T>,
>(schema: T): U {
  const result: UserFormSchema<any> = {};

  if (isPrimitiveValue(schema)) {
    return schema as U;
  }

  for (const key in schema) {
    const element = schema[key];

    if (isPrimitiveValue(element)) {
      result[key] = createField(element);
      continue;
    }

    if (isPrimitiveField(element) || isArrayField(element)) {
      result[key] = element;
      continue;
    }

    if (Array.isArray(element)) {
      result[key] = createArrayField(element as (PrimitiveValue | AnySchema)[]);
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
      case primitiveFieldSymbol: {
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
