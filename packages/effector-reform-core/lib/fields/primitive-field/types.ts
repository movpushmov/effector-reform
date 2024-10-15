import { EventCallable, Store, Event } from 'effector';
import { FieldError } from '../types';
import { primitiveFieldSymbol } from './symbol';

export type PrimitiveJsonValue = string | number | boolean | Date | null;

export type PrimitiveValue =
  | bigint
  | PrimitiveJsonValue
  | Blob
  | ArrayBuffer
  | File
  | FileList;

export interface PrimitiveFieldApi<
  T extends PrimitiveValue,
  Meta extends object = any,
> {
  change: EventCallable<T>;
  changed: Event<T>;

  changeMeta: EventCallable<Meta>;
  metaChanged: EventCallable<Meta>;

  blur: EventCallable<void>;
  focus: EventCallable<void>;
  reset: EventCallable<void>;

  changeError: EventCallable<FieldError>;
  errorChanged: Event<FieldError>;
}

export interface PrimitiveField<
  T extends PrimitiveValue = any,
  Meta extends object = any,
> extends PrimitiveFieldApi<T, Meta> {
  type: PrimitiveFieldSymbolType;

  $meta: Store<Meta>;
  $value: Store<T>;
  $error: Store<FieldError>;

  $isValid: Store<boolean>;
  $isFocused: Store<boolean>;

  reset: EventCallable<void>;
  resetCompleted: Event<{ value: T; error: FieldError }>;

  blur: EventCallable<void>;
  blurred: Event<void>;

  focus: EventCallable<void>;
  focused: Event<void>;

  copyOnCreateForm: boolean;

  '@@unitShape': () => {
    value: Store<T>;
    error: Store<FieldError>;
    meta: Store<Meta>;

    isValid: Store<boolean>;
    isFocused: Store<boolean>;

    changeMeta: EventCallable<Meta>;
    blur: EventCallable<void>;
    focus: EventCallable<void>;
    reset: EventCallable<void>;

    change: EventCallable<T>;
    changeError: EventCallable<FieldError>;
  };
}

export interface CreatePrimitiveFieldOptions<Meta extends object = any> {
  error?: FieldError;
  meta?: Meta;
  copyOnCreateForm?: boolean;
}

export type PrimitiveFieldSymbolType = typeof primitiveFieldSymbol;
