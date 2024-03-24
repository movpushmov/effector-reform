import { EventCallable, Store, Event } from 'effector';
import { FieldError } from '../types';
import { primaryFieldSymbol } from './symbol';

export type PrimaryJsonValue = string | number | boolean | Date;

export type PrimaryValue =
  | bigint
  | PrimaryJsonValue
  | Blob
  | ArrayBuffer
  | File
  | FileList;

export interface PrimaryFieldApi<T extends PrimaryValue> {
  change: EventCallable<T>;
  changed: Event<T>;

  blur: EventCallable<void>;
  focus: EventCallable<void>;
  reset: EventCallable<void>;

  changeError: EventCallable<FieldError>;
  errorChanged: Event<FieldError>;
}

export interface PrimaryField<T extends PrimaryValue = any>
  extends PrimaryFieldApi<T> {
  type: PrimaryFieldSymbolType;

  $value: Store<T>;
  $error: Store<FieldError>;

  $isDirty: Store<boolean>;
  $isValid: Store<boolean>;
  $isFocused: Store<boolean>;

  blur: EventCallable<void>;
  blurred: Event<void>;

  focus: EventCallable<void>;
  focused: Event<void>;

  forkOnCreateForm: boolean;

  fork: (options?: CreatePrimaryFieldOptions) => PrimaryField<T>;

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

export interface CreatePrimaryFieldOptions {
  error?: FieldError;
  clearOuterErrorOnChange?: boolean;
  forkOnCreateForm?: boolean;
}

export type PrimaryFieldSymbolType = typeof primaryFieldSymbol;
