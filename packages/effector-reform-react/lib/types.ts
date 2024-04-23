import {
  ArrayField,
  ArrayFieldItemType,
  FieldError,
  FormValues,
  InsertOrReplacePayload,
  MovePayload,
  PrimitiveField,
  PrimitiveValue,
  PushPayload,
  ReadyFieldsGroupSchema,
  RemovePayload,
  SwapPayload,
  UnshiftPayload,
} from '@effector-reform/core';
import { StoreValue } from 'effector';

export interface ReactPrimitiveFieldApi<T extends PrimitiveValue> {
  value: T;
  error: FieldError;

  isValid: boolean;
  isDirty: boolean;

  onChangeError: (newError: FieldError) => void;
  onChange: (newValue: T) => void;
  onFocus: () => void;
  onBlur: () => void;
}

export interface ReactArrayFieldApi<
  T extends ReadyFieldsGroupSchema | PrimitiveValue,
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

export type ReactFields<Fields extends ReadyFieldsGroupSchema> = {
  [K in keyof Fields]: Fields[K] extends PrimitiveField<any>
    ? ReactPrimitiveFieldApi<StoreValue<Fields[K]['$value']>>
    : Fields[K] extends ArrayField<any>
      ? ReactArrayFieldApi<StoreValue<Fields[K]['$values']>[number]>
      : Fields[K] extends ReadyFieldsGroupSchema
        ? ReactFields<Fields[K]>
        : never;
};
