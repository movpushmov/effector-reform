import { Event, EventCallable } from 'effector';
import { FormErrors, FormValues } from '../form';
import { ReadyFieldsGroupSchema } from './fields-group';
import { PrimaryValue } from './primary-field';

export type FieldError = string | null;

export type InnerFieldApi = { setInnerError: EventCallable<FieldError> };
export type InnerArrayFieldApi = {
  setInnerError: EventCallable<FieldError>;
  cleared: Event<number[]>;
};

export type FieldValidationFn<Value> = (
  value: Value,
) => FieldError | Promise<FieldError>;

export type FormFieldValidationFn<Schema extends ReadyFieldsGroupSchema> = (
  values: FormValues<Schema>,
  meta: { values: FormValues<Schema> },
) => { path: string; error: FieldError }[];

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
