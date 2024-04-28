import { ReadyFieldsGroupSchema } from '../fields-group';
import type { ArrayField } from './types';
import {
  PrimitiveField,
  PrimitiveValue,
  isPrimitiveValue,
  primitiveFieldSymbol,
} from '../primitive-field';
import { arrayFieldSymbol } from './symbol';
import { InnerArrayFieldApi, InnerFieldApi } from '../types';
import { clearUnits } from '../../utils';
import { clearPrimitiveFieldMemory } from '../primitive-field/utils';

export function filterUnused<T>(arr: T[], newArr: T[]) {
  return arr.reduce(
    (acc, value, index) => {
      if (!newArr.includes(value)) {
        acc.nodes.push(value);
        acc.indexes.push(index);
      }

      return acc;
    },
    { nodes: [] as T[], indexes: [] as number[] },
  );
}

export function clearArrayFieldMemory(field: ArrayField<any>, deep = false) {
  const api = field as ArrayField<any> & InnerArrayFieldApi;

  clearUnits([
    api.$values,
    api.$error,
    api.change,
    api.changed,
    api.changeError,
    api.errorChanged,
    api.insert,
    api.inserted,
    api.move,
    api.moved,
    api.pop,
    api.popped,
    api.push,
    api.pushed,
    api.remove,
    api.removed,
    api.replace,
    api.replaced,
    api.swap,
    api.swapped,
    api.unshift,
    api.unshifted,
    api.clear,
    api.cleared,
    api.reset,
    api.resetCompleted,
    api.setInnerError,
    api.batchedSetValue,
    api.batchedSetOuterError,
    api.batchedSetInnerError,
    api.batchedClear,
    api.batchedReset,
  ]);
}

export function clearArrayFieldValuesMemory(
  schema: ReadyFieldsGroupSchema | PrimitiveValue,
) {
  if (isPrimitiveValue(schema)) {
    return;
  }

  for (const key in schema) {
    const node = schema[key];

    switch (node.type) {
      case arrayFieldSymbol: {
        const values = node.$values.getState();

        for (const subNode of values) {
          if (isPrimitiveValue(subNode)) {
            break;
          }

          clearArrayFieldValuesMemory(subNode);
        }

        clearArrayFieldMemory(node);

        break;
      }
      case primitiveFieldSymbol: {
        clearPrimitiveFieldMemory(node);

        break;
      }
      default: {
        clearArrayFieldValuesMemory(node);
        break;
      }
    }
  }
}

export function isArrayField(
  props: any,
): props is ArrayField<ReadyFieldsGroupSchema> {
  return 'type' in props && props.type === arrayFieldSymbol;
}
