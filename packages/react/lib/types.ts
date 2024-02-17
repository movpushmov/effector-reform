import {
  ArrayField,
  ArrayFieldItem,
  FieldError,
  FormFields,
  PrimaryField,
  PrimaryValue,
} from '@effector-composable-forms/core';
import { StoreValue } from 'effector';

export interface ReactPrimaryFieldApi<T extends PrimaryValue> {
  value: T;
  error: FieldError;

  onChange: (newValue: T) => void;
  onErrorChange: (newError: FieldError) => void;
}

export interface ReactArrayFieldApi<T extends ArrayFieldItem | FormFields> {
  values: T[];
  error: FieldError;

  onChange: (newValue: T) => void;
  onErrorChange: (newError: FieldError) => void;
}

export type ReactFields<Fields extends FormFields> = {
  [K in keyof Fields]: Fields[K] extends PrimaryField<any>
    ? ReactPrimaryFieldApi<StoreValue<Fields[K]['$value']>>
    : Fields[K] extends ArrayField<ArrayFieldItem>
      ? ReactArrayFieldApi<StoreValue<Fields[K]['$values']>[number]>
      : Fields[K] extends FormFields
        ? ReactFields<Fields[K]>
        : never;
};
