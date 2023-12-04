import { createEffect, createEvent, createStore, Effect, EventCallable, sample, Store } from 'effector'

interface FieldConfig<T> {
  forkOnCompose?: boolean;
  defaultError?: string | null;
  onValidate?: (value: T) => string | null;
}

interface ForkConfig<T> {
  value?: T;
  defaultError?: string | null;
  onValidate?: (value: T) => string | null;
  forkOnCompose?: boolean;
}

export interface Field<T> {
  $value: Store<T>;
  $error: Store<string | null>;
  $isValid: Store<boolean>;
  $hasErrors: Store<boolean>;

  forkOnCompose: boolean;

  validate: EventCallable<void>;
  validated: EventCallable<void>;

  change: EventCallable<T>;
  changed: EventCallable<T>;

  setError: EventCallable<string | null>;

  fork: (config?: ForkConfig<T>) => Field<T>;

  validateFx: Effect<T, string | null>;
  '@@unitShape': () => ({
    value: Store<T>;
    error: Store<string | null>;
    isValid: Store<boolean>;
    hasErrors: Store<boolean>;

    validate: EventCallable<void>;
    validated: EventCallable<void>;

    change: EventCallable<T>;
    changed: EventCallable<T>;

    setError: EventCallable<string | null>;
  });
}

export function createField<T>(defaultValue: T, config?: FieldConfig<T>): Field<T> {
  const { defaultError = null, onValidate = () => null, forkOnCompose = true } = config ?? {};

  const $value = createStore(defaultValue);
  const $error = createStore(defaultError);
  const $isValid = $error.map(error => !error);
  const $hasErrors = $error.map(Boolean);

  const validate = createEvent<void>();
  const validated = createEvent<void>();
  const validateFx = createEffect<T, string | null>(
    (value) => onValidate(value)
  );

  const change = createEvent<T>();
  const changed = createEvent<T>();

  const setError = createEvent<string | null>();

  sample({
    clock: change,
    target: [changed, $value],
  });

  sample({
    clock: [validate, $value],
    source: $value,
    fn: (value) => value,
    target: validateFx,
  });

  sample({
    clock: validateFx.done,
    filter: ({ result }) => !result,
    fn: ({ params }) => params,
    target: validated,
  });

  sample({
    clock: validateFx.done,
    filter: ({ result }) => Boolean(result),
    fn: ({ result }) => result,
    target: $error,
  });

  sample({
    clock: setError,
    target: $error,
  });

  const field = {
    $value,
    $error,
    $isValid,
    $hasErrors,
    forkOnCompose,
    validate,
    validated,
    change,
    changed,
    validateFx,
    setError,

    '@@unitShape': () => ({
      value: $value,
      error: $error,
      isValid: $isValid,
      hasErrors: $hasErrors,

      validate,
      validated,

      change,
      changed,

      setError,
    })
  };

  return {
    ...field,
    fork: (config) => createField(config?.value ?? $value.getState(), {
      defaultError: config?.defaultError ?? $error.getState() ?? null,
      forkOnCompose: config?.forkOnCompose ?? forkOnCompose,
    }),
  };
}
