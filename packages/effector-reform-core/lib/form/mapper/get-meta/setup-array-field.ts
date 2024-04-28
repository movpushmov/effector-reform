import {
  ArrayField,
  FieldError,
  InnerArrayFieldApi,
  isPrimitiveValue,
} from '../../../fields';
import { createEffect, sample } from 'effector';
import { Node } from '../types';
import { MapFn, This } from './types';
import { FieldInteractionEventPayload } from '../map-schema/types';
import { clearArrayFieldMemory } from '../../../fields/array-field/utils';
import { clearUnits } from '../../../utils';
import { combineEvents } from 'patronum';
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
    error: null,
    errors: [],
  };

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
      resultErrorsNode[key] = {
        error: null,
        errors: [],
      };

      mapValues(values);
    },
  );

  const changeErrorFx = createEffect(
    ({ error }: { error: FieldError; batchInfo?: { id: string } }) => {
      resultErrorsNode[key].error = error;
    },
  );

  const clearFx = createEffect<{ batchInfo?: { id: string } }, void>(() => {
    getArrayFieldApi(this.api, apiKey).clearValuesMemory();

    resultValuesNode[key] = [];
    resultErrorsNode[key] = {
      error: null,
      errors: [],
    };
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

      mapValues(values);
    },
  );

  // not batched flow
  sample({
    clock: [
      combineEvents([field.setInnerError, field.errorChanged]),
      combineEvents([field.changeError, field.errorChanged]),
    ],
    source: field.$error,
    fn: (error) => ({ error }),
    target: changeErrorFx,
  });

  sample({
    clock: [
      combineEvents([field.change, field.changed]),
      combineEvents([field.pushed, field.changed]),
      combineEvents([field.swapped, field.changed]),
      combineEvents([field.moved, field.changed]),
      combineEvents([field.inserted, field.changed]),
      combineEvents([field.unshifted, field.changed]),
      combineEvents([field.removed, field.changed]),
      combineEvents([field.popped, field.changed]),
      combineEvents([field.replaced, field.changed]),
    ],
    source: field.$values,
    fn: (values) => ({ values }),
    target: changeValuesFx,
  });

  sample({
    clock: combineEvents([field.reset, field.resetCompleted]),
    source: [field.$values, field.$error] as const,
    fn: ([values, error]) => ({
      values,
      error,
    }),
    target: resetFx,
  });

  sample({
    clock: combineEvents([field.clear, field.cleared]),
    fn: () => ({}),
    target: clearFx,
  });

  // batched flow
  sample({
    clock: combineEvents([field.batchedClear, field.cleared]),
    fn: ([{ '@@batchInfo': batchInfo }]) => ({ batchInfo }),
    target: clearFx,
  });

  sample({
    clock: combineEvents([field.batchedReset, field.resetCompleted]),
    fn: ([{ '@@batchInfo': batchInfo }, { values, error }]) => ({
      values,
      error,
      batchInfo,
    }),
    target: resetFx,
  });

  sample({
    clock: combineEvents([field.batchedSetValue, field.changed]),
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

  this.api[apiKey] = {
    type: 'array-field',

    reset: field.reset,
    clear: field.clear,

    batchedSetValue: field.batchedSetValue,
    batchedSetOuterError: field.batchedSetOuterError,
    batchedSetInnerError: field.batchedSetInnerError,
    batchedReset: field.batchedReset,
    batchedClear: field.batchedClear,

    clearMemory: () => {
      clearArrayFieldMemory(field, true);
      clearUnits([changeErrorFx, changeValuesFx, clearFx, resetFx], true);
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
}
