import { EventCallable, Event, Store, StoreValue } from 'effector';
import {
  AnySchema,
  ArrayField,
  ArrayFieldApi,
  ArrayFieldSymbolType,
  FieldError,
  PartialRecursive,
  PrimitiveField,
  PrimitiveFieldApi,
  PrimitiveFieldSymbolType,
  PrimitiveValue,
  ReadyFieldsGroupSchema,
  UserFormSchema,
} from '../fields';
import { Contract } from '@withease/contracts';

export type ErrorsSchemaPayload = Record<string, FieldError>;

export type SyncValidationFn<Schema extends AnySchema> = (
  values: FormValues<UserFormSchema<Schema>>,
) => ErrorsSchemaPayload | null;

export type AsyncValidationFn<Schema extends AnySchema> = (
  values: FormValues<UserFormSchema<Schema>>,
) => Promise<ErrorsSchemaPayload | null>;

export type ValidationStrategy = 'blur' | 'focus' | 'change' | 'submit';

export interface CreateFormOptions<T extends AnySchema> {
  schema: T;
  validation?:
    | SyncValidationFn<T>
    | AsyncValidationFn<T>
    | Contract<unknown, FormValues<UserFormSchema<T>>>;
  validationStrategies?: ValidationStrategy[] | Store<ValidationStrategy[]>;
  clearOuterErrorsOnSubmit?: boolean;
}

export type FormValues<T extends ReadyFieldsGroupSchema> = {
  [K in keyof T]: T[K] extends PrimitiveField<any>
    ? StoreValue<T[K]['$value']>
    : T[K] extends ArrayField<any, any, infer D>
      ? D extends ReadyFieldsGroupSchema
        ? FormValues<D>[]
        : D[]
      : T[K] extends ReadyFieldsGroupSchema
        ? FormValues<T[K]>
        : never;
};

export type AnyFieldApi =
  | (PrimitiveFieldApi<PrimitiveValue> & {
      type: PrimitiveFieldSymbolType;
      $value: Store<PrimitiveValue>;
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

export type FormErrors<T extends ReadyFieldsGroupSchema | PrimitiveValue> =
  T extends ReadyFieldsGroupSchema
    ? {
        [K in keyof T]: T[K] extends PrimitiveField<any>
          ? FieldError
          : T[K] extends PrimitiveValue
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
  $snapshot: Store<Values>;

  $isChanged: Store<boolean>;
  $isValid: Store<boolean>;

  $isValidationPending: Store<boolean>;

  fill: EventCallable<{
    values?: PartialRecursive<Values>;
    errors?: ErrorsSchemaPayload;
  }>;
  filled: Event<void>;

  changed: EventCallable<Values>;
  errorsChanged: Event<Errors>;

  validate: EventCallable<void>;
  validated: Event<Values>;
  validatedAndSubmitted: Event<Values>;
  validationFailed: Event<Values>;

  submit: EventCallable<void>;
  submitted: Event<Values>;

  reset: EventCallable<void>;
  clearOuterErrors: EventCallable<void>;
  clearInnerErrors: EventCallable<void>;

  forceUpdateSnapshot: EventCallable<void>;
  snapshotUpdated: Event<void>;

  metaChanged: EventCallable<{ fieldPath: string; meta: any }>;

  '@@unitShape': () => {
    values: Store<Values>;
    errors: Store<Errors>;
    snapshot: Store<Values>;

    isChanged: Store<boolean>;
    isValid: Store<boolean>;
    isValidationPending: Store<boolean>;

    submit: EventCallable<void>;
    validate: EventCallable<void>;

    reset: EventCallable<void>;
    clearOuterErrors: EventCallable<void>;
    clearInnerErrors: EventCallable<void>;
    forceUpdateSnapshot: EventCallable<void>;

    fill: EventCallable<{
      values?: PartialRecursive<Values>;
      errors?: ErrorsSchemaPayload;
      triggerIsDirty?: boolean;
    }>;
  };
};
