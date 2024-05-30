import { combine, createEvent, createStore, sample } from 'effector';
import type {
  CreatePrimitiveFieldOptions,
  PrimitiveField,
  PrimitiveValue,
} from './types';
import {
  FieldBatchedPayload,
  FieldBatchedSetter,
  FieldError,
  InnerFieldApi,
} from '../types';
import { primitiveFieldSymbol } from './symbol';
import { spread } from 'patronum';

const defaultOptions: CreatePrimitiveFieldOptions = {
  error: null,
  meta: {},
  forkOnCreateForm: true,
};

export function createField<
  T extends PrimitiveValue,
  Meta extends object = any,
>(
  defaultValue: T,
  overrides?: CreatePrimitiveFieldOptions<Meta>,
): PrimitiveField<T, Meta> {
  const clearOuterErrorOnChange = Boolean(overrides?.clearOuterErrorOnChange);

  const options = { ...defaultOptions, ...overrides };

  const $value = createStore(defaultValue, { name: '<field value>' });

  const $innerError = createStore<FieldError>(null, {
    name: '<inner field error>',
  });

  const $outerError = createStore<FieldError>(overrides?.error ?? null, {
    name: '<outer field error>',
  });

  const $error = combine({
    innerError: $innerError,
    outerError: $outerError,
  }).map(({ innerError, outerError }) => outerError || innerError);

  const $isValid = $error.map((error) => error === null);
  const $isDirty = createStore(false);
  const $isFocused = createStore(false);

  const $meta = createStore<Meta>(options.meta);

  const changeMeta = createEvent<Meta>();
  const metaChanged = createEvent<Meta>();

  sample({
    clock: changeMeta,
    target: $meta,
  });

  sample({
    clock: $meta,
    target: metaChanged,
  });

  const change = createEvent<T>('<field change>');
  const changed = createEvent<T>('<field changed>');

  const blur = createEvent();
  const blurred = createEvent();

  const focus = createEvent();
  const focused = createEvent();

  const changeError = createEvent<FieldError>('<field setError>');
  const errorChanged = createEvent<FieldError>('<field error changed>');

  const setInnerError = createEvent<FieldError>();
  const setOuterError = createEvent<FieldError>();

  const reset = createEvent('<field reset>');
  const resetCompleted = createEvent('<field reset completed>');

  const batchedSetInnerError = createEvent<FieldBatchedSetter<FieldError>>();
  const batchedSetOuterError = createEvent<FieldBatchedSetter<FieldError>>();
  const batchedSetValue = createEvent<FieldBatchedSetter<T>>();
  const batchedReset = createEvent<FieldBatchedPayload>();

  if (clearOuterErrorOnChange) {
    sample({ clock: $value, fn: () => null, target: $outerError });
  }

  sample({ clock: blur, fn: () => false, target: $isFocused });
  sample({ clock: focus, fn: () => true, target: $isFocused });

  sample({ clock: $isFocused, filter: (focused) => focused, target: focused });
  sample({ clock: $isFocused, filter: (focused) => !focused, target: blurred });

  sample({
    clock: setInnerError,
    target: $innerError,
  });

  sample({
    clock: changeError,
    target: $outerError,
  });

  sample({ clock: change, target: $value });

  sample({ clock: $value, fn: () => true, target: $isDirty });

  sample({
    clock: batchedSetValue,
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

  sample({ clock: $value, target: changed });
  sample({ clock: changeError, target: $outerError });

  sample({ clock: $error, target: errorChanged });
  sample({ clock: setInnerError, target: $innerError });

  sample({
    clock: [reset, batchedReset],
    fn: () => ({
      value: defaultValue,
      error: overrides?.error ?? null,
      isDirty: false,
    }),
    target: spread({ value: $value, error: $outerError, isDirty: $isDirty }),
  });

  sample({
    clock: [reset, batchedReset],
    target: resetCompleted,
  });

  return {
    type: primitiveFieldSymbol,

    batchedSetInnerError,
    batchedSetOuterError,
    batchedSetValue,
    batchedReset,

    $meta,
    $value,
    $outerError,
    $innerError,
    $error,

    $isValid,
    $isDirty,
    $isFocused,

    changeMeta,
    metaChanged,

    blur,
    blurred,

    focus,
    focused,

    change,
    changed,

    changeError,
    errorChanged,

    reset,
    resetCompleted,

    setInnerError,
    setOuterError,

    forkOnCreateForm: options.forkOnCreateForm,

    fork: (options?: CreatePrimitiveFieldOptions) =>
      createField(defaultValue, { ...overrides, ...options }),

    '@@unitShape': () => ({
      value: $value,
      error: $error,
      meta: $meta,

      isValid: $isValid,
      isDirty: $isDirty,
      isFocused: $isFocused,

      changeMeta,

      blur,
      blurred,

      focus,
      focused,

      changeError,
      change,
      reset,
    }),
  } as PrimitiveField<T> & InnerFieldApi<T>;
}
