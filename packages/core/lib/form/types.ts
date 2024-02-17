import { EventCallable, Store, StoreValue } from 'effector';
import {
  ArrayField,
  ArrayFieldApi,
  ArrayFieldItem,
  ArrayFieldType,
  FieldError,
  PrimaryField,
  PrimaryFieldApi,
  PrimaryFieldType,
  PrimaryValue,
  ReadyFieldsGroupSchema,
  UserFormSchema,
} from '../fields';

export interface ComposeOptions {}

export type OnNodeHandlers = {
  onArrayField?: (node: ArrayField<ArrayFieldItem>, path: string[]) => void;
  onPrimaryField?: (node: PrimaryField<PrimaryValue>, path: string[]) => void;
};

export type SetValuePayload = { field: string; value: any };
export type SetValuesPayload = SetValuePayload[];

export type SetErrorPayload = { field: string; value: string | null };
export type SetErrorsPayload = SetErrorPayload[];

export type FormValues<T extends ReadyFieldsGroupSchema | ArrayFieldItem> = {
  [k: string]: T extends PrimaryField<any>
    ? StoreValue<T['$value']>
    : T extends ArrayField<ArrayFieldItem>
      ? FormValues<StoreValue<T['$values']>[number]>
      : FormValues<T>;
};

export interface WatchSchemaResult<T extends ReadyFieldsGroupSchema> {
  $values: Store<FormValues<T>>;
  $errors: Store<FormErrors<T>>;
}

export type AnyFieldApi =
  | (PrimaryFieldApi<PrimaryValue> & {
      type: PrimaryFieldType;
      $value: Store<PrimaryValue>;
      $error: Store<FieldError>;
    })
  | (ArrayFieldApi<any> & {
      type: ArrayFieldType;
      $values: Store<FormFields[]>;
      $error: Store<FieldError>;
    });

export type FormFields = {
  [k: string]: FormFields | AnyFieldApi;
};

export type FormErrors<T> = {
  [k: string]: T extends PrimaryField<any>
    ? StoreValue<T['$error']>
    : T extends ArrayField<ArrayFieldItem>
      ? FormErrors<StoreValue<T['$error']>>
      : FormErrors<T>;
};

export type FormType<
  Fields extends UserFormSchema<any>,
  Values extends FormValues<any>,
  Errors extends FormErrors<any>,
> = {
  fields: Fields;
  $values: Store<Values>;
  $errors: Store<Errors>;

  changed: EventCallable<Values>;
  errorsChanged: EventCallable<Errors>;

  validate: EventCallable<void>;
  validated: EventCallable<void>;

  submit: EventCallable<void>;
  submitted: EventCallable<Values>;

  '@@unitShape': () => {
    values: Store<Values>;
    errors: Store<Errors>;

    submit: EventCallable<void>;
    validate: EventCallable<void>;
  };
};
