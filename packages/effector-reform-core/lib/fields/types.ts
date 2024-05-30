import { Event, EventCallable, Store } from 'effector';
import { FormErrors, FormValues } from '../form';
import { PrimitiveValue } from './primitive-field';

export type FieldError = string | null;
export type FieldBatchedPayload = {
  '@@batchInfo': { id: string; fieldPath: string };
};

export type FieldBatchedSetter<T> = { value: T } & FieldBatchedPayload;

type FieldInnerBatchSetters<T> = {
  batchedSetInnerError: EventCallable<FieldBatchedSetter<FieldError>>;
  batchedSetOuterError: EventCallable<FieldBatchedSetter<FieldError>>;
  batchedSetValue: EventCallable<FieldBatchedSetter<T>>;
  batchedReset: EventCallable<FieldBatchedPayload>;
};

export type InnerFieldApi<T = any> = FieldInnerBatchSetters<T> & {
  $outerError: Store<string>;
  $innerError: Store<string>;
  setInnerError: EventCallable<FieldError>;
};

export type InnerArrayFieldApi<T = any> = FieldInnerBatchSetters<T> & {
  $outerError: Store<string>;
  $innerError: Store<string>;
  setInnerError: EventCallable<FieldError>;

  batchedClear: EventCallable<FieldBatchedPayload>;
};

export type PartialRecursive<T extends FormErrors<any> | FormValues<any>> =
  Partial<{
    [K in keyof T]: T[K] extends Array<any>
      ? Array<
          T[K][number] extends PrimitiveValue
            ? T[K][number]
            : PartialRecursive<T[K][number]>
        >
      : T[K] extends PrimitiveValue
        ? T[K]
        : T[K] extends object
          ? PartialRecursive<T[K]>
          : T[K];
  }>;
