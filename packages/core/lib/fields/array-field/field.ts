import {
  Json,
  attach,
  combine,
  createEffect,
  createEvent,
  createStore,
  sample,
} from 'effector';
import type {
  ArrayField,
  InsertOrReplacePayload,
  MovePayload,
  PushPayload,
  RemovePayload,
  SwapPayload,
  UnshiftPayload,
  CreateArrayFieldOptions,
  ArrayFieldItemType,
} from './types';
import { spread } from 'patronum';
import { FieldError, InnerArrayFieldApi } from '../types';
import {
  AnySchema,
  ReadyFieldsGroupSchema,
  UserFormSchema,
  prepareFieldsSchema,
} from '../fields-group';
import { PrimaryValue, isPrimaryValue } from '../primary-field';
import { arrayFieldSymbol } from './symbol';
import { clearSchemaNode, filterUnused } from './utils';
import { mapSchema, setFormPartialErrors } from '../../form/utils';
import { isPrimaryJsonValue } from '../primary-field/utils';

const defaultOptions = {
  forkOnCreateForm: true,
};

export function createArrayField<
  T extends PrimaryValue | AnySchema,
  Value = UserFormSchema<T>,
>(values: T[], overrides?: CreateArrayFieldOptions): ArrayField<T, Value> {
  type Values = Value[];

  const clearOuterErrorOnChange = Boolean(overrides?.clearOuterErrorOnChange);

  function getDefaultValues() {
    return values.map(prepareFieldsSchema) as Values;
  }

  function preparePayload<T extends ArrayFieldItemType>(
    payload: T | T[],
  ): Values {
    return Array.isArray(payload)
      ? (payload.map(prepareFieldsSchema) as Values)
      : [prepareFieldsSchema(payload)];
  }

  const options = { ...defaultOptions, ...overrides };

  const clearNodesFx = createEffect(
    ({ nodes, indexes }: ReturnType<typeof filterUnused>) => {
      for (const node of nodes) {
        if (isPrimaryValue(node)) {
          break;
        }

        clearSchemaNode(node as ReadyFieldsGroupSchema | PrimaryValue);
      }

      return indexes;
    },
  );

  const $values = createStore(getDefaultValues(), {
    name: '<array field values>',
    serialize: {
      read(json) {
        if (!json) {
          throw new Error();
        }

        if (!Array.isArray(json)) {
          throw new Error();
        }

        return json.map((schema: any) => {
          const values = prepareFieldsSchema(schema.values);
          const errors = schema.errors;

          const prepared = prepareFieldsSchema(values);
          const api = mapSchema(prepared).$api.getState();

          setFormPartialErrors(errors, api, 'outer');

          return prepared;
        });
      },

      write(state) {
        const readySchemas = state.map((value) =>
          isPrimaryJsonValue(value)
            ? value
            : mapSchema(value as ReadyFieldsGroupSchema),
        );

        return readySchemas
          .map((payload) => {
            if (isPrimaryJsonValue(payload)) {
              return payload;
            }

            if (isPrimaryValue(payload)) {
              return null;
            }

            return {
              values: payload.$values.getState(),
              errors: payload.$errors.getState(),
            };
          })
          .filter(Boolean) as Json[];
      },
    },
  });

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

  const change = createEvent<T[]>();
  const changed = createEvent<Values>();

  const setInnerError = createEvent<FieldError>();
  const changeError = createEvent<FieldError>();
  const errorChanged = createEvent<FieldError>();

  const push = createEvent<PushPayload<T>>();
  const pushed = createEvent<{
    params: PushPayload<T>;
    result: Values;
  }>();

  const swap = createEvent<SwapPayload>();
  const swapped = createEvent<{ params: SwapPayload; result: Values }>();

  const move = createEvent<MovePayload>();
  const moved = createEvent<{ params: MovePayload; result: Values }>();

  const insert = createEvent<InsertOrReplacePayload<T>>();
  const inserted = createEvent<{
    params: InsertOrReplacePayload<T>;
    result: Values;
  }>();

  const unshift = createEvent<UnshiftPayload<T>>();
  const unshifted = createEvent<{
    params: UnshiftPayload<T>;
    result: Values;
  }>();

  const remove = createEvent<RemovePayload>();
  const removed = createEvent<{ params: RemovePayload; result: Values }>();

  const pop = createEvent<void>();
  const popped = createEvent<Values>();

  const replace = createEvent<InsertOrReplacePayload<T>>();
  const replaced = createEvent<{
    params: InsertOrReplacePayload<T>;
    result: Values;
  }>();

  const clear = createEvent();
  const cleared = createEvent();

  const reset = createEvent();

  const syncFx = attach({
    source: $values,
    effect: async (
      values,
      { newValues }: { newValues: Values; type: string },
    ): Promise<Values> => {
      await clearNodesFx(filterUnused(values, newValues));

      return newValues;
    },
  });

  if (clearOuterErrorOnChange) {
    sample({ clock: $values, fn: () => null, target: $outerError });
  }

  sample({ clock: $values, fn: () => true, target: $isDirty });
  sample({ clock: syncFx.doneData, target: $values });

  sample({
    clock: clear,
    fn: () => ({ newValues: [], type: 'clear' }),
    target: [syncFx, cleared],
  });

  sample({
    clock: reset,
    fn: () => ({ newValues: getDefaultValues(), type: 'reset' }),
    target: syncFx,
  });

  const pushFx = attach({
    source: $values,
    effect: (values, payload: PushPayload<T>) =>
      values.concat(preparePayload(payload)),
  });

  const swapFx = attach({
    source: $values,
    effect: (values, payload: SwapPayload) => {
      const newValues = [...values];

      const element = newValues[payload.indexA];

      newValues[payload.indexA] = newValues[payload.indexB];
      newValues[payload.indexB] = element;

      return newValues;
    },
  });

  const moveFx = attach({
    source: $values,
    effect: (values, payload: MovePayload) => {
      const newValues = [...values];
      newValues.splice(payload.to, 0, ...newValues.splice(payload.from, 1));

      return newValues;
    },
  });

  const insertFx = attach({
    source: $values,
    effect: (values, payload: InsertOrReplacePayload<T>) => {
      const newValues = [...values];
      newValues.splice(payload.index, 0, ...preparePayload(payload.value));

      return newValues;
    },
  });

  const unshiftFx = attach({
    source: $values,
    effect: (values, payload: UnshiftPayload<T>) => {
      const newValues = [...values];
      newValues.unshift(...preparePayload(payload));

      return newValues;
    },
  });

  const removeFx = attach({
    source: $values,
    effect: async (values, payload: RemovePayload) => {
      const newValues = [...values];
      newValues.splice(payload.index, 1)[0];

      return newValues;
    },
  });

  const popFx = attach({
    source: $values,
    effect: (values) => {
      const newValues = [...values];
      newValues.pop();

      return newValues;
    },
  });

  const replaceFx = attach({
    source: $values,
    effect: (values, payload: InsertOrReplacePayload<T>) => {
      const newValues = [...values];
      newValues.splice(payload.index, 1, ...preparePayload(payload.value));

      return newValues;
    },
  });

  sample({
    clock: change,
    fn: (payload) => ({ newValues: preparePayload(payload), type: 'change' }),
    target: [syncFx, changed],
  });

  sample({ clock: push, target: pushFx });

  sample({
    clock: pushFx.done,
    fn: ({ params, result }) => ({
      pushed: { params, result },
      values: { newValues: result, type: 'push' },
    }),
    target: spread({
      pushed,
      values: syncFx,
    }),
  });

  sample({ clock: swap, target: swapFx });

  sample({
    clock: swapFx.done,
    fn: ({ params, result }) => ({
      swapped: { params, result },
      values: { newValues: result, type: 'swap' },
    }),
    target: spread({
      swapped,
      values: syncFx,
    }),
  });

  sample({ clock: move, target: moveFx });

  sample({
    clock: moveFx.done,
    fn: ({ params, result }) => ({
      moved: { params, result },
      values: { newValues: result, type: 'move' },
    }),
    target: spread({
      moved,
      values: syncFx,
    }),
  });

  sample({ clock: insert, target: insertFx });

  sample({
    clock: insertFx.done,
    fn: ({ params, result }) => ({
      inserted: { params, result },
      values: { newValues: result, type: 'insert' },
    }),
    target: spread({
      inserted,
      values: syncFx,
    }),
  });

  sample({ clock: unshift, target: unshiftFx });

  sample({
    clock: unshiftFx.done,
    fn: ({ params, result }) => ({
      unshifted: { params, result },
      values: { newValues: result, type: 'unshift' },
    }),
    target: spread({
      unshifted,
      values: syncFx,
    }),
  });

  sample({
    clock: remove,
    target: removeFx,
  });

  sample({
    clock: removeFx.done,
    fn: ({ params, result }) => ({
      removed: { params, result },
      values: { newValues: result, type: 'remove' },
    }),
    target: spread({
      removed,
      values: syncFx,
    }),
  });

  sample({
    clock: pop,
    target: popFx,
  });

  sample({
    clock: popFx.doneData,
    fn: (values) => ({ newValues: values, type: 'pop' }),
    target: [syncFx, popped],
  });

  sample({
    clock: replace,
    target: replaceFx,
  });

  sample({
    clock: replaceFx.done,
    fn: ({ params, result }) => ({
      replaced: { params, result },
      values: { newValues: result, type: 'replace' },
    }),
    target: spread({
      replaced,
      values: syncFx,
    }),
  });

  sample({
    clock: changeError,
    target: $outerError,
  });

  sample({
    clock: setInnerError,
    target: $innerError,
  });

  sample({
    clock: $error,
    target: errorChanged,
  });

  return {
    type: arrayFieldSymbol,

    $values,
    $error,

    $isDirty,
    $isValid,

    setInnerError,
    changeError,
    errorChanged,

    change,
    changed,

    push,
    pushed,

    swap,
    swapped,

    move,
    moved,

    cleared: clearNodesFx.doneData,

    insert,
    inserted,

    unshift,
    unshifted,

    remove,
    removed,

    pop,
    popped,

    replace,
    replaced,

    reset,
    forkOnCreateForm: options.forkOnCreateForm,

    fork: (options?: CreateArrayFieldOptions) =>
      createArrayField(values, { ...overrides, ...options }),

    '@@unitShape': () => ({
      values: $values,
      error: $error,

      isDirty: $isDirty,
      isValid: $isValid,

      change,
      changeError,

      reset,
      push,
      move,
      swap,
      insert,
      unshift,
      remove,
      pop,
      replace,
    }),
  } as ArrayField<T, Value> & InnerArrayFieldApi;
}
