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

  function prepare(
    node: T,
    resultNode: any,
    currentMeta: Meta = { path: [] },
  ): U {
    if (isPrimitiveValue(node)) {
      return node as U;
    }

    for (const key in node) {
      const element = node[key];

      const path = [...currentMeta.path, key];

      if (isPrimitiveValue(element)) {
        resultNode[key] = createField(
          element,
          currentMeta.baseSid
            ? { sid: `${currentMeta.baseSid}|${path.join('.')}` }
            : undefined,
        );
        continue;
      }

      if (isPrimitiveField(element) || isArrayField(element)) {
        resultNode[key] = element;
        continue;
      }

      if (Array.isArray(element)) {
        resultNode[key] = createArrayField(
          element as (PrimitiveValue | AnySchema)[],
          currentMeta.baseSid
            ? { sid: `${currentMeta.baseSid}|${path.join('.')}` }
            : undefined,
        );
        continue;
      }

      if (typeof element === 'object') {
        resultNode[key] = prepare(
          element as any,
          {},
          {
            path,
            baseSid: currentMeta.baseSid,
          },
        );
      }
    }

    return resultNode;
  }

  return withRegion(region, () => prepare(schema, result, meta));
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
