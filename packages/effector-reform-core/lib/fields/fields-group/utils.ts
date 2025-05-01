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
import { createNode, withRegion } from 'effector';

interface Meta {
  path: string[];
  baseSid?: string | null;
}

export function prepareFieldsSchema<
  T extends AnySchema | PrimitiveValue,
  U = UserFormSchema<T>,
>(schema: T, meta: Meta = { path: [] }): U {
  const region = createNode({ regional: true });
  const result: UserFormSchema<any> = {};

  Object.defineProperty(result, 'region', {
    enumerable: false,
    value: region,
  });

  function prepare(schema: T, meta: Meta = { path: [] }): U {
    if (isPrimitiveValue(schema)) {
      return schema as U;
    }

    for (const key in schema) {
      const element = schema[key];

      const path = [...meta.path, key];

      if (isPrimitiveValue(element)) {
        result[key] = createField(
          element,
          meta.baseSid
            ? { sid: `${meta.baseSid}|${path.join('.')}` }
            : undefined,
        );
        continue;
      }

      if (isPrimitiveField(element) || isArrayField(element)) {
        result[key] = element;
        continue;
      }

      if (Array.isArray(element)) {
        result[key] = createArrayField(
          element as (PrimitiveValue | AnySchema)[],
          meta.baseSid
            ? { sid: `${meta.baseSid}|${path.join('.')}` }
            : undefined,
        );
        continue;
      }

      if (typeof element === 'object') {
        result[key] = prepare(element as any, {
          path,
          baseSid: meta.baseSid,
        });
      }
    }

    return result;
  }

  return withRegion(region, () => prepare(schema, meta));
}

export function copyGroup<T extends ReadyFieldsGroupSchema>(group: T): T {
  const result: UserFormSchema<any> = {};

  for (const key in group) {
    const element = group[key];

    switch (element['@@type']) {
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
