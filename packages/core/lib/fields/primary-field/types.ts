import { EventCallable, Store, Event } from 'effector';
import { FieldError } from '../types';

export type PrimaryValue = string | number | boolean | Date;

export interface PrimaryFieldForkConfig<T extends PrimaryValue>
  extends CreatePrimaryFieldOptions {
  value?: T;
  error?: FieldError;
}

export interface PrimaryFieldApi<T extends PrimaryValue> {
  change: EventCallable<T>;
  changed: Event<T>;

  changeError: EventCallable<FieldError>;
  errorChanged: Event<FieldError>;
}

export interface PrimaryField<T extends PrimaryValue = any>
  extends PrimaryFieldApi<T> {
  type: PrimaryFieldType;

  $value: Store<T>;
  $error: Store<FieldError>;

  forkOnCompose: boolean;

  fork: (options?: CreatePrimaryFieldOptions) => PrimaryField<T>;

  '@@unitShape': () => {
    value: Store<T>;
    error: Store<FieldError>;

    change: EventCallable<T>;
    changeError: EventCallable<FieldError>;
  };
}

export interface CreatePrimaryFieldOptions {
  error?: FieldError;
  forkOnCompose?: boolean;
}

export const primaryFieldSymbol = Symbol('primary-field');
export type PrimaryFieldType = typeof primaryFieldSymbol;
