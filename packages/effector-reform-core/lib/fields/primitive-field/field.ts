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
  copyOnCreateForm: true,
};

function createStoreWithSid<T>(name: string, defaultValue: T, sid?: string) {
  return sid
    ? createStore<T>(defaultValue, { name, sid })
    : createStore<T>(defaultValue, { name });
}

export function createField<
  T extends PrimitiveValue,
  Meta extends object = any,
>(
  defaultValue: T,
  overrides?: CreatePrimitiveFieldOptions<Meta>,
): PrimitiveField<T, Meta> {
  const options = { ...defaultOptions, ...overrides };

  const $value = createStoreWithSid<T>(
    '<field value>',
    defaultValue,
    options.sid ? `${options.sid}|value` : undefined,
  );

  const $innerError = createStoreWithSid<FieldError>(
    '<inner field error>',
    null,
    options.sid ? `${options.sid}|innerError` : undefined,
  );

  const $outerError = createStoreWithSid<FieldError>(
    '<outer field error>',
    null,
    options.sid ? `${options.sid}|outerError` : undefined,
  );

  const $error = combine({
    innerError: $innerError,
    outerError: $outerError,
  }).map(({ innerError, outerError }) => outerError || innerError);

  const $isValid = $error.map((error) => error === null);
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
  const resetCompleted = createEvent<{ value: T; error: FieldError }>(
    '<field reset completed>',
  );

  const batchedSetInnerError = createEvent<FieldBatchedSetter<FieldError>>();
  const batchedSetOuterError = createEvent<FieldBatchedSetter<FieldError>>();
  const batchedSetValue = createEvent<FieldBatchedSetter<T>>();
  const batchedReset = createEvent<FieldBatchedPayload>();

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
      outerError: overrides?.error ?? null,
      completed: { value: defaultValue, error: overrides?.error ?? null },
      innerError: null,
    }),
    target: spread({
      value: $value,
      completed: resetCompleted,
      outerError: $outerError,
      innerError: $innerError,
    }),
  });

  return {
    '@@type': primitiveFieldSymbol,

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

    copyOnCreateForm: options.copyOnCreateForm,
    sid: options.sid,

    '@@unitShape': () => ({
      value: $value,
      error: $error,
      meta: $meta,

      isValid: $isValid,
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
