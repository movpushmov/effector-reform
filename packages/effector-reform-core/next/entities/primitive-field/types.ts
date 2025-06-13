import { EventCallable, Event, Store, Effect } from 'effector';
import { FieldError } from '../types';

export interface PrimitiveField<Value = any, Meta extends object = any> {
  '@@type': 'primitive';

  $meta: Store<Meta>;
  $value: Store<Value>;
  $error: Store<FieldError>;

  $isValid: Store<boolean>;
  $isFocused: Store<boolean>;

  reset: EventCallable<void>;
  resetCompleted: Event<{ value: Value; error: FieldError }>;

  blur: EventCallable<void>;
  blurred: Event<void>;

  focus: EventCallable<void>;
  focused: Event<void>;

  change: EventCallable<Value>;
  changed: Event<Value>;

  changeMeta: EventCallable<Meta>;
  metaChanged: EventCallable<Meta>;

  changeError: EventCallable<FieldError>;
  errorChanged: Event<FieldError>;

  '@@unitShape': () => {
    value: Store<Value>;
    error: Store<FieldError>;
    meta: Store<Meta>;

    isValid: Store<boolean>;
    isFocused: Store<boolean>;

    changeMeta: EventCallable<Meta>;
    blur: EventCallable<void>;
    focus: EventCallable<void>;
    reset: EventCallable<void>;

    change: EventCallable<Value>;
    changeError: EventCallable<FieldError>;
  };
}

export interface CreateOptions<Value = any, Meta extends object = any> {
  value: Value;

  error?: FieldError;
  meta?: Meta;

  validation?:
    | (() => Promise<FieldError>)
    | (() => FieldError)
    | Effect<Value, FieldError>;
}

export interface PrimitiveFieldSchema<Value = any, Meta extends object = any> {
  value: Value;
  meta: Meta;
  error: FieldError;
}
