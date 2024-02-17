import {
  arrayFieldSymbol,
  createArrayField,
  isArrayField,
} from '../array-field';
import {
  createField,
  isPrimaryField,
  primaryFieldSymbol,
} from '../primary-field';
import {
  RawFieldsGroupSchema,
  ReadyFieldsGroupSchema,
  UserFormSchema,
} from './types';

export function prepareFieldsSchema<
  T extends RawFieldsGroupSchema | ReadyFieldsGroupSchema,
>(schema: T): UserFormSchema<T> {
  const result: UserFormSchema<any> = {};

  for (const key in schema) {
    const element = schema[key];

    if (isPrimaryField(element) || isArrayField(element)) {
      result[key] = element;
      continue;
    }

    if (Array.isArray(element)) {
      result[key] = createArrayField(element);
      continue;
    }

    if (typeof element === 'object' && !(element instanceof Date)) {
      result[key] = prepareFieldsSchema(element);
      continue;
    }

    result[key] = createField(element);
  }

  return result;
}

export function forkGroup<T extends ReadyFieldsGroupSchema>(
  group: T,
): UserFormSchema<T> {
  const result: UserFormSchema<any> = {};

  for (const key in group) {
    const element = group[key];

    switch (element.type) {
      case arrayFieldSymbol:
      case primaryFieldSymbol: {
        result[key] = element.forkOnCompose ? element.fork() : element;

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
