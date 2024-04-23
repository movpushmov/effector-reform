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

export function clearSchemaNode(
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
        const innerApi = node as ArrayField<any> & InnerArrayFieldApi;

        for (const subNode of values) {
          if (isPrimitiveValue(subNode)) {
            break;
          }

          clearSchemaNode(subNode);
        }

        clearUnits([
          node.$values,
          node.$error,
          node.change,
          node.changed,
          node.changeError,
          node.errorChanged,
          node.insert,
          node.inserted,
          node.move,
          node.moved,
          node.pop,
          node.popped,
          node.push,
          node.pushed,
          node.remove,
          node.removed,
          node.replace,
          node.replaced,
          node.swap,
          node.swapped,
          node.unshift,
          node.unshifted,
          innerApi.setInnerError,
          innerApi.cleared,
          innerApi.batchedSetValue,
          innerApi.notBatchedErrorChanged,
          innerApi.notBatchedValueChanged,
          innerApi.batchedSetOuterError,
          innerApi.batchedSetInnerError,
          innerApi.batchedErrorChanged,
          innerApi.batchedValueChanged,
        ]);

        break;
      }
      case primitiveFieldSymbol: {
        const innerApi = node as PrimitiveField<any> & InnerFieldApi;

        clearUnits([
          node.$value,
          node.$error,
          node.change,
          node.changeError,
          node.errorChanged,
          node.changed,
          innerApi.setInnerError,
          innerApi.batchedSetValue,
          innerApi.notBatchedErrorChanged,
          innerApi.notBatchedValueChanged,
          innerApi.batchedSetOuterError,
          innerApi.batchedSetInnerError,
          innerApi.batchedErrorChanged,
          innerApi.batchedValueChanged,
        ]);

        break;
      }
      default: {
        clearSchemaNode(node);
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
