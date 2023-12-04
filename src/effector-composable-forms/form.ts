import { createField, Field } from './field.ts'
import { combine, createEvent, sample, Store, createEffect, EventCallable } from 'effector'

type FieldValueType<T extends MaybeField> = T extends Field<any> ? T['$value'] extends Store<infer StoreValue> ? StoreValue : any : T;
type FieldsToValues<Fields extends Record<string, MaybeField>> = {
  [K in keyof Fields]: { field: K, value: FieldValueType<Fields[K]> };
}[keyof Fields];

interface Form<Fields extends Record<string, MaybeField>> {
  fields: { [K in keyof Fields]: FormField<FieldValueType<Fields[K]>> };
  $values: Store<{ [K in keyof Fields]: FieldValueType<Fields[K]> }>;
  $errors: Store<{ [K in keyof Fields]: string | null }>;
  setError: EventCallable<{ field: keyof Fields; error: string | null }>;
  setErrors: EventCallable<{ [K in keyof Fields]: string | null }>;
  setValue: EventCallable<{ field: keyof Fields; value: any }>;
  setValues: EventCallable<{ [K in keyof Fields]: FieldValueType<Fields[K]> }>;

  validate: EventCallable<void>;
  validated: EventCallable<void>;
  submit: EventCallable<void>;
}

interface FormField<T> {
  $value: Store<T>;
  $error: Store<string | null>;
  $hasErrors: Store<boolean>;
  $isValid: Store<boolean>;

  change: EventCallable<T>;
  changed: EventCallable<T>;
  setError: EventCallable<string | null>;
  validate: EventCallable<void>;
  validated: EventCallable<void>;

  '@@unitShape': () => ({
    value: Store<T>;
    error: Store<string | null>;
    hasErrors: Store<boolean>;
    isValid: Store<boolean>;

    change: EventCallable<T>;
    setError: EventCallable<string | null>;
    validate: EventCallable<void>;
    validated: EventCallable<void>;
  }),
}

function getFormField<T>(field: Field<T>): FormField<T> {
  return {
    $value: field.$value,
    $error: field.$error,
    $hasErrors: field.$hasErrors,
    $isValid: field.$isValid,

    change: field.change,
    changed: field.changed,

    validate: field.validate,
    validated: field.validated,
    setError: field.setError,

    '@@unitShape': () => ({
      value: field.$value,
      error: field.$error,
      hasErrors: field.$hasErrors,
      isValid: field.$isValid,

      change: field.change,
      setError: field.setError,

      validate: field.validate,
      validated: field.validated,
    }),
  };
}

type MaybeField = Field<any> | string | number | boolean;

function isField<T>(fieldOrValue: MaybeField): fieldOrValue is Field<T> {
  return typeof fieldOrValue === 'object';
}

export function compose<T extends Record<string, MaybeField>>(fieldsSchema: T,): Form<T> {
  const meta = Object.keys(fieldsSchema).reduce((acc, key: keyof T) => {
    const fieldOrValue = fieldsSchema[key];
    const field = isField(fieldOrValue) ? fieldOrValue.forkOnCompose ? fieldOrValue.fork() : fieldOrValue : createField(fieldOrValue)

    acc.fields[key] = getFormField(field);

    acc.values[key] = field.$value as any;
    acc.errors[key] = field.$error;

    return acc;
  }, {
    errors: {} as Record<keyof T, Store<string | null>>,
    values: {} as Record<keyof T, Store<any>>,
    fields: {} as { [K in keyof T]: FormField<FieldValueType<T[K]>> },
  });

  const setErrorFx = createEffect<{ field: keyof Form<T>['fields']; error: string | null }, void>(({ field, error }) => {
    fields[field].setError(error);
  });

  const setErrorsFx = createEffect<{ [K in keyof Form<T>['fields']]: string | null }, void>((fieldToError) => {
    for (const field in fieldToError) {
      fields[field].setError(fieldToError[field]);
    }
  });

  const setValueFx = createEffect<FieldsToValues<T>, void>(({ field, value }) => {
    fields[field].change(value);
  });

  const setValuesFx = createEffect<{ [K in keyof Form<T>['fields']]: FieldValueType<T[K]> }, void>((fieldsToValues) => {
    for (const field in fieldsToValues) {
      fields[field].change(fieldsToValues[field]);
    }
  });

  const validateFx = createEffect(() => true);

  const fields = meta.fields;
  const $values = combine(meta.values) as Store<{ [K in keyof T]: FieldValueType<T[K]> }>;
  const $errors = combine(meta.errors) as Store<Record<keyof T, string | null>>;

  const setError = createEvent<{ field: keyof Form<T>['fields']; error: string | null }>();
  const setErrors = createEvent<{ [K in keyof T]: string | null }>();

  const setValue = createEvent<FieldsToValues<T>>();
  const setValues = createEvent<{ [K in keyof Form<T>['fields']]: FieldValueType<T[K]> }>();

  const validate = createEvent();
  const validated = createEvent();

  const submit = createEvent();
  const submitted = createEvent();

  sample({
    clock: setError,
    target: setErrorFx,
  });

  sample({
    clock: setErrors,
    target: setErrorsFx,
  });

  sample({
    clock: setValue,
    target: setValueFx,
  });

  sample({
    clock: setValues,
    target: setValuesFx,
  });

  sample({
    clock: submit,
    target: validate,
  });

  sample({
    clock: validate,
    target: validateFx,
  });

  sample({
    clock: validateFx.done,
    fn: ({ params }) => params,
    target: validated,
  });

  sample({
    clock: validated,
    filter: Boolean,
    target: [submitted] // add submit fn
  });

  return { fields, $values, $errors, setError, setErrors, setValue, setValues, validate, validated, submit };
}
