import {
  ArrayField,
  FieldError,
  InnerArrayFieldApi,
  isPrimitiveValue,
} from '../../../fields';
import { createEffect, sample } from 'effector';
import { ArrayFieldPathApi, Node } from '../types';
import { MapFn, This } from './types';
import { FieldInteractionEventPayload } from '../map-schema/types';
import { clearArrayFieldMemory } from '../../../fields/array-field/utils';
import { clearUnits, inOrder } from '../../../utils';
import { getArrayFieldApi } from '../../helpers/form-api';

interface Props {
  field: ArrayField<any>;
  path: string[];
  key: string;

  resultValuesNode: Node;
  resultErrorsNode: Node;

  map: MapFn;
}

export function setupArrayField(
  this: This,
  {
    field: rawField,
    path,
    key,
    resultErrorsNode,
    resultValuesNode,
    map,
  }: Props,
) {
  const field = rawField as ArrayField<any> & InnerArrayFieldApi;

  const fieldValues = field.$values.getState();
  const apiKey = [...path, key].join('.');

  resultValuesNode[key] = [];
  resultErrorsNode[key] = {
    error: field.$error.getState(),
    errors: [],
  };

  const fieldApi: ArrayFieldPathApi = {
    type: 'array-field',
    isValid: !Boolean(resultErrorsNode[key].error),

    reset: field.reset,

    batchedSetValue: field.batchedSetValue,
    batchedSetOuterError: field.batchedSetOuterError,
    batchedSetInnerError: field.batchedSetInnerError,
    batchedReset: field.batchedReset,
    batchedClear: field.batchedClear,

    clearMemory: (withField = false) => {
      if (withField) {
        clearArrayFieldMemory(field);
      }

      clearUnits([changeErrorFx, changeValuesFx, clearFx, resetFx]);
      delete this.api[apiKey];
    },

    clearValuesMemory: () => {
      const keys = Object.keys(this.api)
        .filter((key) => key.startsWith(apiKey))
        .filter((key) => key !== apiKey);

      for (const subApiKey of keys) {
        this.api[subApiKey].clearMemory();
      }
    },

    clearInnerError: field.setInnerError.prepend(() => null),
    clearOuterError: field.changeError.prepend(() => null),

    setInnerError: field.setInnerError,
    setOuterError: field.changeError,

    setValue: field.change,
  };

  this.api[apiKey] = fieldApi;

  if (resultErrorsNode[key].error) {
    this.isValid = false;
  }

  const mapValues = (values: any[]) => {
    values.map((item, index) => {
      if (!isPrimitiveValue(item)) {
        resultValuesNode[key].push({});
        resultErrorsNode[key].errors.push({});

        map.call(
          this,
          item,
          resultValuesNode[key][index],
          resultErrorsNode[key].errors[index],
          [...path, key, index.toString()],
        );
      } else {
        resultValuesNode[key].push(item);
      }
    });
  };

  mapValues(fieldValues);

  const changeValuesFx = createEffect(
    ({ values }: { values: any[]; batchInfo?: { id: string } }) => {
      getArrayFieldApi(this.api, apiKey).clearValuesMemory();

      resultValuesNode[key] = [];
      resultErrorsNode[key].errors = [];

      mapValues(values);
    },
  );

  const changeErrorFx = createEffect(
    ({ error }: { error: FieldError; batchInfo?: { id: string } }) => {
      resultErrorsNode[key].error = error;

      fieldApi.isValid = !Boolean(resultErrorsNode[key].error);

      if (resultErrorsNode[key].error) {
        this.isValid = false;
      }
    },
  );

  const clearFx = createEffect<{ batchInfo?: { id: string } }, void>(() => {
    getArrayFieldApi(this.api, apiKey).clearValuesMemory();

    resultValuesNode[key] = [];
    resultErrorsNode[key] = {
      error: null,
      errors: [],
    };

    fieldApi.isValid = !Boolean(resultErrorsNode[key].error);
  });

  const resetFx = createEffect(
    ({
      error,
      values,
    }: {
      values: any[];
      error: FieldError;
      batchInfo?: { id: string };
    }) => {
      getArrayFieldApi(this.api, apiKey).clearValuesMemory();

      resultValuesNode[key] = [];
      resultErrorsNode[key] = {
        error: error,
        errors: [],
      };

      fieldApi.isValid = !Boolean(resultErrorsNode[key].error);

      mapValues(values);
    },
  );

  // not batched flow
  sample({
    clock: [
      inOrder([field.setInnerError, field.errorChanged]),
      inOrder([field.changeError, field.errorChanged]),
    ],
    source: field.$error,
    fn: (error) => ({ error }),
    target: changeErrorFx,
  });

  sample({
    clock: [
      inOrder([field.change, field.changed]),
      inOrder([field.pushed, field.changed]),
      inOrder([field.swapped, field.changed]),
      inOrder([field.moved, field.changed]),
      inOrder([field.inserted, field.changed]),
      inOrder([field.unshifted, field.changed]),
      inOrder([field.removed, field.changed]),
      inOrder([field.popped, field.changed]),
      inOrder([field.replaced, field.changed]),
    ],
    fn: ([, values]) => ({ values }),
    target: changeValuesFx,
  });

  sample({
    clock: inOrder([field.reset, field.resetCompleted]),
    source: [field.$values, field.$error] as const,
    fn: ([values, error]) => ({
      values,
      error,
    }),
    target: resetFx,
  });

  sample({
    clock: inOrder([field.clear, field.cleared]),
    fn: () => ({}),
    target: clearFx,
  });

  // batching fix (effector skips value update)
  sample({
    clock: field.batchedSetValue,
    filter: ({ value: values }) => resultValuesNode[key] === values,
    fn: ({ '@@batchInfo': batchInfo }) => ({
      fieldPath: apiKey,
      '@@batchInfo': batchInfo,
    }),
    target: this.batchedSchemaUpdated,
  });

  // batched flow
  sample({
    clock: inOrder([field.batchedClear, field.cleared]),
    fn: ([{ '@@batchInfo': batchInfo }]) => ({ batchInfo }),
    target: clearFx,
  });

  sample({
    clock: inOrder([field.batchedReset, field.resetCompleted]),
    fn: ([{ '@@batchInfo': batchInfo }, { values, error }]) => ({
      values,
      error,
      batchInfo,
    }),
    target: resetFx,
  });

  sample({
    clock: inOrder([field.batchedSetValue, field.changed]),
    source: field.$values,
    fn: (values, [{ '@@batchInfo': batchInfo }]) => ({ values, batchInfo }),
    target: changeValuesFx,
  });

  sample({
    clock: field.batchedSetInnerError,
    source: field.$outerError,
    fn: (outerError, { value, '@@batchInfo': batchInfo }) => ({
      error: outerError ?? value,
      batchInfo,
    }),
    target: changeErrorFx,
  });

  sample({
    clock: field.batchedSetOuterError,
    fn: ({ value: error, '@@batchInfo': batchInfo }) => ({ error, batchInfo }),
    target: changeErrorFx,
  });

  sample({
    clock: changeErrorFx.done,
    filter: ({ params }) => !params.batchInfo,
    fn: (): FieldInteractionEventPayload => ({
      fieldPath: apiKey,
      type: 'error',
    }),
    target: this.schemaUpdated,
  });

  sample({
    clock: [
      changeValuesFx.done,
      changeErrorFx.done,
      resetFx.done,
      clearFx.done,
    ],
    filter: ({ params }) => !!params.batchInfo,
    fn: ({ params }) => ({
      fieldPath: apiKey,
      '@@batchInfo': params.batchInfo!,
    }),
    target: this.batchedSchemaUpdated,
  });

  sample({
    clock: changeValuesFx.done,
    filter: ({ params }) => !params.batchInfo,
    fn: (): FieldInteractionEventPayload => ({
      fieldPath: apiKey,
      type: 'value',
    }),
    target: this.schemaUpdated,
  });

  sample({
    clock: field.metaChanged,
    fn: (meta) => ({ fieldPath: apiKey, meta }),
    target: this.metaChanged,
  });
}
