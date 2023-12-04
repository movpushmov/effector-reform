import { createField, Field } from './field.ts'
import { attach, combine, createEvent, Event, sample, Store } from 'effector'
import { createEffect } from 'effector/effector.cjs'

type FieldValueType<T extends MaybeField> = T extends Field<any> ? T['$value'] extends Store<infer StoreValue> ? StoreValue : any : T;

interface Form<Fields extends Record<string, MaybeField>> {
  fields: { [K in keyof Fields]: FormField<FieldValueType<Fields[K]>> };
  $values: Store<{ [K in keyof Fields]: FieldValueType<Fields[K]> }>;
  $errors: Store<{ [K in keyof Fields]: string | null }>;
  setError: Event<{ field: keyof Fields; error: string | null }>;
  setErrors: Event<{ [K in keyof Fields]: string | null }>;
  setValue: Event<{ field: keyof Fields; value: any }>;
  setValues: Event<{ [K in keyof Fields]: FieldValueType<Fields[K]> }>;

  validate: Event<void>;
  validated: Event<void>;
  submit: Event<void>;
}

interface FormField<T> {
  $value: Store<T>;
  $error: Store<string | null>;
  $hasErrors: Store<boolean>;
  $isValid: Store<boolean>;

  change: Event<T>;
  changed: Event<T>;
  setError: Event<string | null>;
  validate: Event<void>;
  validated: Event<void>;

  '@@unitShape': () => ({
    value: Store<T>;
    error: Store<string | null>;
    hasErrors: Store<boolean>;
    isValid: Store<boolean>;

    change: Event<T>;
    setError: Event<string | null>;
    validate: Event<void>;
    validated: Event<void>;
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

type MaybeField = Field<any> | string | number;

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

  const setErrorFx = createEffect<{ field: keyof Form<T>['fields']; error: string | null }>(({ field, error }) => {
    const trigger = createEvent();

    sample({
      clock: trigger,
      fn: () => error,
      target: fields[field].setError
    });

    trigger();
  });

  const fields = meta.fields;
  const $values = combine(meta.values) as Store<{ [K in keyof T]: FieldValueType<T[K]> }>;
  const $errors = combine(meta.errors) as Store<Record<keyof T, string | null>>;

  const setError = createEvent<{ field: keyof Form<T>['fields']; error: string | null }>();
  const setErrors = createEvent<{ [K in keyof T]: string | null }>();

  const setValue = createEvent<{ field: keyof Form<T>['fields']; value: any }>();
  const setValues = createEvent<{ [K in keyof T]: FieldValueType<T[K]> }>();

  const validate = createEvent();
  const validated = createEvent();

  const submit = createEvent();

  sample({
    clock: setError,
    fn: ({ field, error }) =>,
    target:
  })

  return { fields, $values, $errors, setError, setErrors, setValue, setValues, validate, validated, submit };
}
