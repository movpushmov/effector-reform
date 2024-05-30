import {
  ArrayField,
  PrimitiveField,
  isPrimitiveValue,
  PrimitiveValue,
  ArrayFieldItemType,
} from '@effector-reform/core';
import { useProvidedScope, useUnit } from 'effector-react';
import { useMemo } from 'react';
import { getFields, getPrimitiveField } from './utils';
import type { ReactArrayFieldApi, ReactPrimitiveFieldApi } from '../types';

export function useField<T extends PrimitiveValue>(
  field: PrimitiveField<T>,
): ReactPrimitiveFieldApi<T> {
  useUnit(field);

  return getPrimitiveField(field, useProvidedScope());
}

export function useArrayField<
  T extends ArrayField<any>,
  Value extends ArrayFieldItemType = T extends ArrayField<any, infer D>
    ? D
    : never,
>(field: T): ReactArrayFieldApi<Value> {
  type Values = ReactArrayFieldApi<Value>['values'];

  const scope = useProvidedScope();
  const {
    values,
    meta,
    changeMeta,
    change,
    changeError,
    reset,
    pop,
    push,
    replace,
    remove,
    swap,
    move,
    unshift,
    insert,
    ...params
  } = useUnit(field);
  const syncedValues = useMemo(
    () =>
      values.map((item) =>
        isPrimitiveValue(item) ? item : getFields(item, scope),
      ) as Values,
    [values],
  );

  return {
    values: syncedValues,
    meta,
    onChangeMeta: changeMeta,
    onChange: change,
    onChangeError: changeError,
    onReset: reset,
    onSwap: swap,
    onMove: move,
    onUnshift: unshift,
    onInsert: insert,
    onReplace: replace,
    onRemove: remove,
    onPop: pop,
    onPush: push,
    ...params,
  };
}
