import { combine, createEvent, createStore, sample } from 'effector';
import type {
  CreatePrimaryFieldOptions,
  PrimaryField,
  PrimaryValue,
} from './types';
import { FieldError, InnerFieldApi } from '../types';
import { primaryFieldSymbol } from './symbol';

const defaultOptions = {
  error: null,
  forkOnCompose: true,
};

export function createField<T extends PrimaryValue>(
  defaultValue: T,
  overrides?: CreatePrimaryFieldOptions,
): PrimaryField<T> {
  const clearOuterErrorOnChange = Boolean(overrides?.clearOuterErrorOnChange);

  const options = { ...defaultOptions, ...overrides };

  const $value = createStore(defaultValue, { name: '<field value>' });

  const $innerError = createStore<FieldError>(null, {
    name: '<inner field error>',
  });

  const $outerError = createStore<FieldError>(null, {
    name: '<outer field error>',
  });

  const $error = combine({
    innerError: $innerError,
    outerError: $outerError,
  }).map(({ innerError, outerError }) => outerError || innerError);

  const $isValid = $error.map((error) => error === null);
  const $isDirty = createStore(false);

  const change = createEvent<T>('<field change>');
  const changed = createEvent<T>('<field changed>');

  const changeError = createEvent<FieldError>('<field setError>');
  const errorChanged = createEvent<FieldError>('<field error changed>');

  const setInnerError = createEvent<FieldError>();

  const reset = createEvent('<field reset>');

  if (clearOuterErrorOnChange) {
    sample({ clock: $value, fn: () => null, target: $outerError });
  }

  sample({ clock: change, target: $value });
  sample({ clock: $value, fn: () => true, target: $isDirty });

  sample({ clock: $value, target: changed });
  sample({ clock: changeError, target: $outerError });

  sample({ clock: $error, target: errorChanged });
  sample({ clock: setInnerError, target: $innerError });

  sample({ clock: reset, fn: () => defaultValue, target: $value });
  sample({ clock: reset, fn: () => null, target: [$innerError, $outerError] });
  sample({ clock: reset, fn: () => false, target: $isDirty });

  sample({
    clock: reset,
    fn: () => null,
    target: [setInnerError, changeError],
  });

  return {
    type: primaryFieldSymbol,

    $value,
    $error,

    $isValid,
    $isDirty,

    change,
    changed,

    changeError,
    errorChanged,

    reset,
    setInnerError,

    forkOnCompose: options.forkOnCompose,

    fork: (options?: CreatePrimaryFieldOptions) =>
      createField(defaultValue, { ...overrides, ...options }),

    '@@unitShape': () => ({
      value: $value,
      error: $error,

      isValid: $isValid,
      isDirty: $isDirty,

      changeError,
      change,
      reset,
    }),
  } as PrimaryField<T> & InnerFieldApi;
}
