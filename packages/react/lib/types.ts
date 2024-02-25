import {
  ArrayField,
  ArrayFieldItemType,
  FieldError,
  FormFields,
  FormValues,
  InsertOrReplacePayload,
  MovePayload,
  PrimaryField,
  PrimaryValue,
  PushPayload,
  ReadyFieldsGroupSchema,
  RemovePayload,
  SwapPayload,
  UnshiftPayload,
} from '@effector-composable-forms/core';
import { StoreValue } from 'effector';

export interface ReactPrimaryFieldApi<T extends PrimaryValue> {
  value: T;
  error: FieldError;

  isValid: boolean;
  isDirty: boolean;

  change: (newValue: T) => void;
  errorChange: (newError: FieldError) => void;
}

export interface ReactArrayFieldApi<
  T extends ReadyFieldsGroupSchema | PrimaryValue,
  Payload extends ArrayFieldItemType = T extends ReadyFieldsGroupSchema
    ? T | FormValues<T>
    : T,
> {
  values: (T extends ReadyFieldsGroupSchema ? ReactFields<T> : T)[];
  error: FieldError;

  isValid: boolean;
  isDirty: boolean;

  reset: () => void;
  change: (values: Payload[]) => void;
  changeError: (error: FieldError) => void;
  push: (payload: PushPayload<Payload>) => void;
  swap: (payload: SwapPayload) => void;
  move: (payload: MovePayload) => void;
  insert: (payload: InsertOrReplacePayload<Payload>) => void;
  unshift: (payload: UnshiftPayload<Payload>) => void;
  remove: (payload: RemovePayload) => void;
  pop: (payload: void) => void;
  replace: (payload: InsertOrReplacePayload<Payload>) => void;
}

export type ReactFields<Fields extends FormFields> = {
  [K in keyof Fields]: Fields[K] extends PrimaryField<any>
    ? ReactPrimaryFieldApi<StoreValue<Fields[K]['$value']>>
    : Fields[K] extends ArrayField<any>
      ? ReactArrayFieldApi<StoreValue<Fields[K]['$values']>[number]>
      : Fields[K] extends FormFields
        ? ReactFields<Fields[K]>
        : never;
};
