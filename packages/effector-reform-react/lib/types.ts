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
  isFocused: boolean;

  onChangeError: (newError: FieldError) => void;
  onChange: (newValue: T) => void;
  onFocus: () => void;
  onBlur: () => void;
}

export interface ReactArrayFieldApi<
  T extends ArrayFieldItemType,
  Payload extends ArrayFieldItemType = T extends ReadyFieldsGroupSchema
    ? T | FormValues<T>
    : T,
> {
  values: (T extends ReadyFieldsGroupSchema ? ReactFields<T> : T)[];
  error: FieldError;

  isValid: boolean;
  isDirty: boolean;

  onChange: (values: Payload[]) => void;
  onChangeError: (error: FieldError) => void;
  onReset: () => void;
  onPush: (payload: PushPayload<Payload>) => void;
  onSwap: (payload: SwapPayload) => void;
  onMove: (payload: MovePayload) => void;
  onInsert: (payload: InsertOrReplacePayload<Payload>) => void;
  onUnshift: (payload: UnshiftPayload<Payload>) => void;
  onRemove: (payload: RemovePayload) => void;
  onPop: (payload: void) => void;
  onReplace: (payload: InsertOrReplacePayload<Payload>) => void;
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
