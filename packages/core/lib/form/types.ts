import { EventCallable, Event, Store, StoreValue } from 'effector';
import {
  AnySchema,
  ArrayField,
  ArrayFieldApi,
  ArrayFieldSymbolType,
  FieldError,
  PartialRecursive,
  PrimaryField,
  PrimaryFieldApi,
  PrimaryFieldSymbolType,
  PrimaryValue,
  ReadyFieldsGroupSchema,
  UserFormSchema,
} from '../fields';

export type ErrorsSchemaPayload = Record<string, FieldError>;

export type SyncValidationFn<
  Schema extends ReadyFieldsGroupSchema,
  Values = FormValues<Schema>,
> = (values: Values) => ErrorsSchemaPayload | null;

export type AsyncValidationFn<
  Schema extends ReadyFieldsGroupSchema,
  Values = FormValues<Schema>,
> = (values: Values) => Promise<ErrorsSchemaPayload | null>;

type ValidationStrategy = 'blur' | 'focus' | 'change' | 'submit';

export interface CreateFormOptions<
  RawSchema extends AnySchema,
  Schema extends ReadyFieldsGroupSchema = UserFormSchema<RawSchema>,
> {
  validation?: SyncValidationFn<Schema> | AsyncValidationFn<Schema>;
  validationStrategies?: ValidationStrategy[];
  clearOuterErrorsOnSubmit?: boolean;
}

export type OnNodeHandlers = {
  onArrayField?: (
    node: ArrayField<ReadyFieldsGroupSchema>,
    nodeKey: string,
    path: string[],
  ) => void;

  onPrimaryField?: (
    node: PrimaryField<PrimaryValue>,
    nodeKey: string,
    path: string[],
  ) => void;

  onGroup?: (
    node: ReadyFieldsGroupSchema,
    nodeKey: string,
    path: string[],
  ) => void;
};

export type FormValues<T extends ReadyFieldsGroupSchema> = {
  [K in keyof T]: T[K] extends PrimaryField<any>
    ? StoreValue<T[K]['$value']>
    : T[K] extends ArrayField<any, infer D>
      ? D extends ReadyFieldsGroupSchema
        ? FormValues<D>[]
        : D[]
      : T[K] extends ReadyFieldsGroupSchema
        ? FormValues<T[K]>
        : never;
};

export type AnyFieldApi =
  | (PrimaryFieldApi<PrimaryValue> & {
      type: PrimaryFieldSymbolType;
      $value: Store<PrimaryValue>;
      $error: Store<FieldError>;
      $isDirty: Store<boolean>;
      $isValid: Store<boolean>;
    })
  | (ArrayFieldApi<any, any> & {
      type: ArrayFieldSymbolType;
      $values: Store<FormFields[]>;
      $error: Store<FieldError>;
      $isDirty: Store<boolean>;
      $isValid: Store<boolean>;
    });

export type FormFields = {
  [k: string]: FormFields | AnyFieldApi;
};

export type FormErrors<T extends ReadyFieldsGroupSchema | PrimaryValue> =
  T extends ReadyFieldsGroupSchema
    ? {
        [K in keyof T]: T[K] extends PrimaryField<any>
          ? FieldError
          : T[K] extends PrimaryValue
            ? FieldError
            : T[K] extends ArrayField<any, infer Schema>
              ? {
                  error: FieldError;
                  errors: Schema extends ReadyFieldsGroupSchema
                    ? FormErrors<Schema>[]
                    : [];
                }
              : T[K] extends AnySchema
                ? FormErrors<T>
                : FieldError;
      }
    : T;

export type FormType<
  Fields extends UserFormSchema<any>,
  Values extends FormValues<any>,
  Errors extends FormErrors<any>,
> = {
  fields: Fields;

  $values: Store<Values>;
  $errors: Store<Errors>;

  $isValid: Store<boolean>;
  $isDirty: Store<boolean>;

  $isValidationPending: Store<boolean>;

  setValues: EventCallable<Values>;
  setPartialValues: EventCallable<PartialRecursive<Values>>;

  setErrors: EventCallable<ErrorsSchemaPayload>;

  changed: EventCallable<Values>;
  errorsChanged: Event<Errors>;

  validate: EventCallable<void>;
  validated: Event<void>;
  validatedAndSubmitted: Event<void>;

  submit: EventCallable<void>;
  submitted: Event<Values>;

  reset: EventCallable<void>;

  '@@unitShape': () => {
    values: Store<Values>;
    errors: Store<Errors>;

    isValid: Store<boolean>;
    isDirty: Store<boolean>;
    isValidationPending: Store<boolean>;

    submit: EventCallable<void>;
    validate: EventCallable<void>;

    reset: EventCallable<void>;

    setValues: EventCallable<Values>;
    setErrors: EventCallable<ErrorsSchemaPayload>;

    setPartialValues: EventCallable<PartialRecursive<Values>>;
  };
};
