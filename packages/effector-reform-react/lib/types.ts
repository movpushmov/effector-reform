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

export interface ReactPrimitiveFieldApi<
  T extends PrimitiveValue,
  Meta extends object = any,
> {
  value: T;
  meta: Meta;
  error: FieldError;

  isValid: boolean;
  isDirty: boolean;
  isFocused: boolean;

  onChangeError: (newError: FieldError) => void;
  onChange: (newValue: T) => void;
  onFocus: () => void;
  onBlur: () => void;
  onChangeMeta: (meta: Meta) => void;
}

export interface ReactArrayFieldApi<
  T extends ArrayFieldItemType,
  Meta extends object = any,
  Payload extends ArrayFieldItemType = T extends ReadyFieldsGroupSchema
    ? T | FormValues<T>
    : T,
> {
  values: (T extends ReadyFieldsGroupSchema ? ReactFields<T> : T)[];
  meta: Meta;
  error: FieldError;

  isValid: boolean;
  isDirty: boolean;

  onChange: (values: Payload[]) => void;
  onChangeError: (error: FieldError) => void;
  onChangeMeta: (meta: Meta) => void;
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
    ? ReactPrimitiveFieldApi<
        StoreValue<Fields[K]['$value']>,
        Fields[K] extends PrimitiveField<any, infer K> ? K : never
      >
    : Fields[K] extends ArrayField<any>
      ? ReactArrayFieldApi<
          StoreValue<Fields[K]['$values']>[number],
          Fields[K] extends ArrayField<any, infer K> ? K : never
        >
      : Fields[K] extends ReadyFieldsGroupSchema
        ? ReactFields<Fields[K]>
        : never;
};
