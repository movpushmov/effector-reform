import { createStore, combine, createEvent, sample } from 'effector';
import { CreateOptions, PrimitiveField, PrimitiveFieldSchema } from './types';
import { FieldError } from '../types';
import { spread } from 'patronum';

function createField<Value, Meta extends object>(
  options: CreateOptions<Value, Meta>,
): PrimitiveField<Value, Meta> {
  const { value, error, meta } = options;

  const $value = createStore<Value>(value);
  const $innerError = createStore<FieldError>(null);
  const $outerError = createStore<FieldError>(error ?? null);

  const $error = combine({
    innerError: $innerError,
    outerError: $outerError,
  }).map(({ innerError, outerError }) => outerError || innerError);

  const $isValid = $error.map((error) => error === null);
  const $isFocused = createStore(false);

  const $meta = createStore<Meta>(meta ?? ({} as Meta));

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

  const change = createEvent<Value>();
  const changed = createEvent<Value>();

  const blur = createEvent();
  const blurred = createEvent();

  const focus = createEvent();
  const focused = createEvent();

  const changeError = createEvent<FieldError>();
  const errorChanged = createEvent<FieldError>();

  const setInnerError = createEvent<FieldError>();
  const setOuterError = createEvent<FieldError>();

  const reset = createEvent('<field reset>');
  const resetCompleted = createEvent<{ value: Value; error: FieldError }>(
    '<field reset completed>',
  );

  sample({ clock: blur, fn: () => false, target: $isFocused });
  sample({ clock: focus, fn: () => true, target: $isFocused });

  sample({
    clock: $isFocused,
    filter: (focused) => focused,
    target: focused,
  });
  sample({
    clock: $isFocused,
    filter: (focused) => !focused,
    target: blurred,
  });

  sample({
    clock: setInnerError,
    target: $innerError,
  });

  sample({
    clock: setOuterError,
    target: $outerError,
  });

  sample({ clock: change, target: $value });
  sample({ clock: $value, target: changed });
  sample({ clock: $error, target: errorChanged });
  sample({ clock: changeError, target: setOuterError });

  sample({
    clock: [reset],
    fn: () => ({
      value,
      outerError: error ?? null,
      completed: { value, error: error ?? null },
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
    '@@type': 'primitive',

    $meta,
    $value,

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
  };
}

function createSchema<Value, Meta extends object>(
  options: CreateOptions<Value, Meta>,
): PrimitiveFieldSchema<Value, Meta> {
  return { meta: {} as Meta, error: null, ...options };
}

export const primitiveField = {
  create: createField,
  schema: createSchema,
};
