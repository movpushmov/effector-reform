import { EventCallable, Store, Event } from 'effector';
import { FieldError } from '../types';
import { primaryFieldSymbol } from './symbol';

export type PrimaryValue =
  | string
  | number
  | bigint
  | boolean
  | Date
  | Blob
  | Buffer
  | ArrayBuffer
  | Int8Array
  | Int16Array
  | Int32Array
  | BigInt64Array
  | File
  | FileList;

export interface PrimaryFieldForkConfig<T extends PrimaryValue>
  extends CreatePrimaryFieldOptions {
  value?: T;
  error?: FieldError;
}

export interface PrimaryFieldApi<T extends PrimaryValue> {
  change: EventCallable<T>;
  changed: Event<T>;

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

  forkOnCompose: boolean;

  fork: (options?: CreatePrimaryFieldOptions) => PrimaryField<T>;

  '@@unitShape': () => {
    value: Store<T>;
    error: Store<FieldError>;

    isDirty: Store<boolean>;
    isValid: Store<boolean>;

    reset: EventCallable<void>;

    change: EventCallable<T>;
    changeError: EventCallable<FieldError>;
  };
}

export interface CreatePrimaryFieldOptions {
  error?: FieldError;
  forkOnCompose?: boolean;
}

export type PrimaryFieldSymbolType = typeof primaryFieldSymbol;
