import { Event, EventCallable } from 'effector';
import { FormErrors, FormValues } from '../form';
import { PrimaryValue } from './primary-field';

export type FieldError = string | null;
export type FieldBatchedSetter<T> = {
  value: T;
  '@@batchInfo': { id: string; fieldPath: string };
};

type FieldInnerBatchSetters<T> = {
  batchedSetInnerError: EventCallable<FieldBatchedSetter<FieldError>>;
  batchedSetOuterError: EventCallable<FieldBatchedSetter<FieldError>>;
  batchedSetValue: EventCallable<FieldBatchedSetter<T>>;

  batchedValueChanged: EventCallable<FieldBatchedSetter<T>>;
  batchedErrorChanged: EventCallable<FieldBatchedSetter<FieldError>>;
  notBatchedErrorChanged: EventCallable<FieldError>;
  notBatchedValueChanged: EventCallable<T>;
};

export type InnerFieldApi<T = any> = FieldInnerBatchSetters<T> & {
  setInnerError: EventCallable<FieldError>;
};

export type InnerArrayFieldApi<T = any> = FieldInnerBatchSetters<T> & {
  setInnerError: EventCallable<FieldError>;
  cleared: Event<number[]>;
};

export type PartialRecursive<T extends FormErrors<any> | FormValues<any>> =
  Partial<{
    [K in keyof T]: T[K] extends Array<any>
      ? Array<PartialRecursive<T[K][number]>>
      : T[K] extends PrimaryValue
        ? T[K]
        : T[K] extends object
          ? PartialRecursive<T[K]>
          : T[K];
  }>;
