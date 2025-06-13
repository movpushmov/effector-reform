import { EventCallable, Store, Event, Effect } from 'effector';
import { FieldError } from '../types';

export type ArrayFieldItemType = any;

export type PushPayload<T extends ArrayFieldItemType> = T | T[];
export type UnshiftPayload<T extends ArrayFieldItemType> = T | T[];
export type SwapPayload = { indexA: number; indexB: number };
export type MovePayload = { from: number; to: number };
export type InsertOrReplacePayload<T extends ArrayFieldItemType> = {
  index: number;
  value: T | T[];
};
export type RemovePayload = { index: number };

export interface ArrayField<
  T extends ArrayFieldItemType,
  Meta extends object = any,
> {
  '@@type': 'array';

  $meta: Store<Meta>;
  $error: Store<FieldError>;

  $isValid: Store<boolean>;

  changeError: EventCallable<FieldError>;
  change: EventCallable<T[]>;
  push: EventCallable<PushPayload<T>>;
  swap: EventCallable<SwapPayload>;
  move: EventCallable<MovePayload>;
  insert: EventCallable<InsertOrReplacePayload<T>>;
  unshift: EventCallable<UnshiftPayload<T>>;
  remove: EventCallable<RemovePayload>;
  pop: EventCallable<void>;
  replace: EventCallable<InsertOrReplacePayload<T>>;
  reset: EventCallable<void>;
  clear: EventCallable<void>;

  changeMeta: EventCallable<Meta>;
  metaChanged: Event<Meta>;

  changed: Event<any[]>;
  cleared: EventCallable<void>;
  resetCompleted: EventCallable<{ values: any[]; error: FieldError }>;
  errorChanged: Event<FieldError>;
  pushed: Event<{ params: PushPayload<T>; result: any[] }>;
  swapped: Event<{ params: SwapPayload; result: any[] }>;
  moved: Event<{ params: MovePayload; result: any[] }>;
  inserted: Event<{
    params: InsertOrReplacePayload<T>;
    result: any[];
  }>;
  unshifted: Event<{
    params: UnshiftPayload<T>;
    result: any[];
  }>;
  removed: Event<{ params: RemovePayload; result: any[] }>;
  popped: Event<any[]>;
  replaced: Event<{
    params: InsertOrReplacePayload<T>;
    result: any[];
  }>;

  '@@unitShape': () => {
    values: Store<any[]>;
    error: Store<FieldError>;
    meta: Store<Meta>;

    isValid: Store<boolean>;

    changeMeta: EventCallable<Meta>;
    reset: EventCallable<void>;
    clear: EventCallable<void>;
    change: EventCallable<T[]>;
    changeError: EventCallable<FieldError>;
    push: EventCallable<PushPayload<T>>;
    swap: EventCallable<SwapPayload>;
    move: EventCallable<MovePayload>;
    insert: EventCallable<InsertOrReplacePayload<T>>;
    unshift: EventCallable<UnshiftPayload<T>>;
    remove: EventCallable<RemovePayload>;
    pop: EventCallable<void>;
    replace: EventCallable<InsertOrReplacePayload<T>>;
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

export interface CreateArrayFieldOptions<Meta extends object = any> {
  error?: FieldError;
  meta?: Meta;
  copyOnCreateForm?: boolean;
  sid?: string | null;
}

export interface ArrayFieldSchema<Value = any, Meta extends object = any> {
  values: Value[];
  errors: any[];
  error: FieldError;
  meta: Meta;
}
