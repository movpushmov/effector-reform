import {
  ArrayField,
  PrimitiveField,
  isPrimitiveValue,
} from '@effector-reform/core';
import { useProvidedScope, useUnit } from 'effector-react';
import { useMemo } from 'react';
import { getFields } from './utils';
import type { ReactFields } from '../types';
import type { StoreValue } from 'effector';

export function useField<T extends PrimitiveField<any>>(field: T) {
  return useUnit(field);
}

export function useArrayField<T extends ArrayField<any>>(field: T) {
  type Values = ReactFields<StoreValue<T['$values']>[number]>;

  const scope = useProvidedScope();
  const { values, ...params } = useUnit(field);
  const syncedValues = useMemo(
    () =>
      values.map((item) =>
        isPrimitiveValue(item) ? item : getFields(item, scope),
      ) as Values,
    [values],
  );

  return { values: syncedValues, ...params };
}
