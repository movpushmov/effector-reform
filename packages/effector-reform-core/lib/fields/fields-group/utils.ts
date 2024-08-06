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
import { copy } from '../copy';

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

export function copyGroup<T extends ReadyFieldsGroupSchema>(group: T): T {
  const result: UserFormSchema<any> = {};

  for (const key in group) {
    const element = group[key];

    switch (element.type) {
      case arrayFieldSymbol: {
        result[key] = element.copyOnCreateForm ? copy(element) : element;
        break;
      }
      case primitiveFieldSymbol: {
        result[key] = element.copyOnCreateForm ? copy(element) : element;
        break;
      }
      case undefined: {
        result[key] = copyGroup(element);
        break;
      }
    }
  }

  return result;
}
