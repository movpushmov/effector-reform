import { ReadyFieldsGroupSchema } from '../fields-group';
import type { ArrayField } from './types';
import { arrayFieldSymbol } from './symbol';

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

export function isArrayField(
  props: any,
): props is ArrayField<ReadyFieldsGroupSchema> {
  return '@@type' in props && props['@@type'] === arrayFieldSymbol;
}
