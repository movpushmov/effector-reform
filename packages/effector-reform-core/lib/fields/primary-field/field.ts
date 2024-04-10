import { combine, createEvent, createStore, sample } from 'effector';
import type {
  CreatePrimaryFieldOptions,
  PrimaryField,
  PrimaryValue,
} from './types';
import { FieldBatchedSetter, FieldError, InnerFieldApi } from '../types';
import { primaryFieldSymbol } from './symbol';

const defaultOptions = {
  error: null,
  forkOnCreateForm: true,
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
  const $isFocused = createStore(false);

  const change = createEvent<T>('<field change>');
  const changed = createEvent<T>('<field changed>');

  const blur = createEvent();
  const blurred = createEvent();

  const focus = createEvent();
  const focused = createEvent();

  const changeError = createEvent<FieldError>('<field setError>');
  const errorChanged = createEvent<FieldError>('<field error changed>');

  const setInnerError = createEvent<FieldError>();

  const reset = createEvent('<field reset>');

  const batchedSetInnerError = createEvent<FieldBatchedSetter<FieldError>>();
  const batchedSetOuterError = createEvent<FieldBatchedSetter<FieldError>>();
  const batchedSetValue = createEvent<FieldBatchedSetter<T>>();

  const batchedValueChanged = createEvent<FieldBatchedSetter<T>>();
  const batchedErrorChanged = createEvent<FieldBatchedSetter<FieldError>>();
  const notBatchedValueChanged = createEvent<T>();
  const notBatchedErrorChanged = createEvent<FieldError>();

  if (clearOuterErrorOnChange) {
    sample({ clock: $value, fn: () => null, target: $outerError });
  }

  sample({ clock: blur, fn: () => false, target: $isFocused });
  sample({ clock: focus, fn: () => true, target: $isFocused });

  sample({ clock: $isFocused, filter: (focused) => focused, target: focused });
  sample({ clock: $isFocused, filter: (focused) => !focused, target: blurred });

  sample({
    clock: setInnerError,
    source: $outerError,
    fn: (outerError, innerError) => outerError || innerError,
    target: notBatchedErrorChanged,
  });

  sample({
    clock: changeError,
    target: notBatchedErrorChanged,
  });

  sample({ clock: change, target: notBatchedValueChanged });
  sample({ clock: notBatchedValueChanged, target: $value });

  sample({ clock: $value, fn: () => true, target: $isDirty });

  sample({
    clock: batchedSetValue,
    target: batchedValueChanged,
  });

  sample({
    clock: batchedValueChanged,
    fn: (payload) => payload.value,
    target: $value,
  });

  sample({
    clock: batchedSetInnerError,
    fn: (payload) => payload.value,
    target: $innerError,
  });

  sample({
    clock: batchedSetOuterError,
    fn: (payload) => payload.value,
    target: $outerError,
  });

  sample({
    clock: batchedSetInnerError,
    source: $outerError,
    fn: (outerError, info) => ({ ...info, value: outerError || info.value }),
    target: batchedErrorChanged,
  });

  sample({
    clock: batchedSetOuterError,
    target: batchedErrorChanged,
  });

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

    batchedSetInnerError,
    batchedSetOuterError,
    batchedSetValue,

    batchedErrorChanged,
    batchedValueChanged,
    notBatchedErrorChanged,
    notBatchedValueChanged,

    $value,
    $error,

    $isValid,
    $isDirty,
    $isFocused,

    blur,
    blurred,

    focus,
    focused,

    change,
    changed,

    changeError,
    errorChanged,

    reset,
    setInnerError,

    forkOnCreateForm: options.forkOnCreateForm,

    fork: (options?: CreatePrimaryFieldOptions) =>
      createField(defaultValue, { ...overrides, ...options }),

    '@@unitShape': () => ({
      value: $value,
      error: $error,

      isValid: $isValid,
      isDirty: $isDirty,
      isFocused: $isFocused,

      blur,
      blurred,

      focus,
      focused,

      changeError,
      change,
      reset,
    }),
  } as PrimaryField<T> & InnerFieldApi<T>;
}
