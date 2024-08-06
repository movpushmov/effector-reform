import { Event, EventCallable, Store } from 'effector';
import { FieldError } from '../types';
import { AnySchema, UserFormSchema } from '../fields-group';
import { PrimitiveValue } from '../primitive-field';
import { arrayFieldSymbol } from './symbol';

export type ArrayFieldItemType = AnySchema | PrimitiveValue;

export type PushPayload<T extends ArrayFieldItemType> = T | T[];
export type UnshiftPayload<T extends ArrayFieldItemType> = T | T[];
export type SwapPayload = { indexA: number; indexB: number };
export type MovePayload = { from: number; to: number };
export type InsertOrReplacePayload<T extends ArrayFieldItemType> = {
  index: number;
  value: T | T[];
};
export type RemovePayload = { index: number };

export interface ArrayFieldApi<
  T extends ArrayFieldItemType,
  U,
  Meta extends object = any,
> {
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

  changed: Event<U[]>;
  cleared: EventCallable<void>;
  resetCompleted: EventCallable<{ values: U[]; error: FieldError }>;
  errorChanged: Event<FieldError>;
  pushed: Event<{ params: PushPayload<T>; result: U[] }>;
  swapped: Event<{ params: SwapPayload; result: U[] }>;
  moved: Event<{ params: MovePayload; result: U[] }>;
  inserted: Event<{
    params: InsertOrReplacePayload<T>;
    result: U[];
  }>;
  unshifted: Event<{
    params: UnshiftPayload<T>;
    result: U[];
  }>;
  removed: Event<{ params: RemovePayload; result: U[] }>;
  popped: Event<U[]>;
  replaced: Event<{
    params: InsertOrReplacePayload<T>;
    result: U[];
  }>;
}

export interface ArrayField<
  T extends ArrayFieldItemType,
  Meta extends object = any,
  U = UserFormSchema<T>,
> extends ArrayFieldApi<T, U, Meta> {
  type: ArrayFieldSymbolType;

  $meta: Store<Meta>;
  $values: Store<U[]>;
  $error: Store<FieldError>;

  $isDirty: Store<boolean>;
  $isValid: Store<boolean>;

  copyOnCreateForm: boolean;
  clearOuterErrorOnChange: boolean;

  '@@unitShape': () => {
    values: Store<U[]>;
    error: Store<FieldError>;
    meta: Store<Meta>;

    isDirty: Store<boolean>;
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

export interface CreateArrayFieldOptions<Meta extends object = any> {
  error?: FieldError;
  meta?: Meta;
  copyOnCreateForm?: boolean;
  clearOuterErrorOnChange?: boolean;
}

export type ArrayFieldSymbolType = typeof arrayFieldSymbol;
