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

export interface PrimitiveFieldApi<T extends PrimitiveValue> {
  change: EventCallable<T>;
  changed: Event<T>;

  blur: EventCallable<void>;
  focus: EventCallable<void>;
  reset: EventCallable<void>;

  changeError: EventCallable<FieldError>;
  errorChanged: Event<FieldError>;
}

export interface PrimitiveField<T extends PrimitiveValue = any>
  extends PrimitiveFieldApi<T> {
  type: PrimitiveFieldSymbolType;

  $value: Store<T>;
  $error: Store<FieldError>;

  $isDirty: Store<boolean>;
  $isValid: Store<boolean>;
  $isFocused: Store<boolean>;

  reset: EventCallable<void>;
  resetCompleted: Event<void>;

  blur: EventCallable<void>;
  blurred: Event<void>;

  focus: EventCallable<void>;
  focused: Event<void>;

  forkOnCreateForm: boolean;

  fork: (options?: CreatePrimitiveFieldOptions) => PrimitiveField<T>;

  '@@unitShape': () => {
    value: Store<T>;
    error: Store<FieldError>;

    isDirty: Store<boolean>;
    isValid: Store<boolean>;
    isFocused: Store<boolean>;

    blur: EventCallable<void>;
    focus: EventCallable<void>;
    reset: EventCallable<void>;

    change: EventCallable<T>;
    changeError: EventCallable<FieldError>;
  };
}

export interface CreatePrimitiveFieldOptions {
  error?: FieldError;
  clearOuterErrorOnChange?: boolean;
  forkOnCreateForm?: boolean;
}

export type PrimitiveFieldSymbolType = typeof primitiveFieldSymbol;
