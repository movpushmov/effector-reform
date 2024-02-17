import { ArrayField, PrimaryField } from '@effector-composable-forms/core';
import { useUnit } from 'effector-react';

export function useField<T extends PrimaryField<any>>(field: T) {
  return useUnit(field);
}

export function useArrayField<T extends ArrayField<any>>(field: T) {
  return useUnit(field);
}
