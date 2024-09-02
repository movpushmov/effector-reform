import { FieldError, InnerFieldApi, PrimitiveField } from '../../../fields';
import { createEffect, sample } from 'effector';
import { Node, PrimitiveFieldPathApi } from '../types';
import { This } from './types';
import { FieldInteractionEventPayload } from '../map-schema/types';
import { combineEvents } from 'patronum';
import { clearPrimitiveFieldMemory } from '../../../fields/primitive-field/utils';
import { clearUnits } from '../../../utils';

interface Props {
  field: PrimitiveField;
  path: string[];
  key: string;

  resultValuesNode: Node;
  resultErrorsNode: Node;
}

export function setupPrimitiveField(
  this: This,
  { resultValuesNode, resultErrorsNode, field: rawField, key, path }: Props,
) {
  const field = rawField as PrimitiveField & InnerFieldApi;

  resultValuesNode[key] = field.$value.getState();
  resultErrorsNode[key] = field.$error.getState();

  const apiKey = [...path, key].join('.');

  const fieldApi: PrimitiveFieldPathApi = {
    type: 'primitive-field',
    isValid: !Boolean(resultErrorsNode[key]),

    reset: field.reset,

    clearMemory: (withField = false) => {
      if (withField) {
        clearPrimitiveFieldMemory(field);
      }

      clearUnits([changeValueFx, changeErrorFx, resetFx]);
      delete this.api[apiKey];
    },

    batchedSetValue: field.batchedSetValue,
    batchedSetOuterError: field.batchedSetOuterError,
    batchedSetInnerError: field.batchedSetInnerError,
    batchedReset: field.batchedReset,

    clearInnerError: field.setInnerError.prepend(() => null),
    clearOuterError: field.changeError.prepend(() => null),

    setInnerError: field.setInnerError,
    setOuterError: field.changeError,

    setValue: field.change,
  };

  this.api[apiKey] = fieldApi;

  if (resultErrorsNode[key]) {
    this.isValid = false;
  }

  const changeValueFx = createEffect(
    ({ value }: { value: any; batchInfo?: { id: string } }) => {
      resultValuesNode[key] = value;
    },
  );

  const changeErrorFx = createEffect(
    ({ error }: { error: FieldError; batchInfo?: { id: string } }) => {
      resultErrorsNode[key] = error;

      fieldApi.isValid = !Boolean(resultErrorsNode[key]);

      if (resultErrorsNode[key]) {
        this.isValid = false;
      }
    },
  );

  const resetFx = createEffect(
    ({
      value,
      error,
    }: {
      value: any;
      error: FieldError;
      batchInfo?: { id: string };
    }) => {
      resultValuesNode[key] = value;
      resultErrorsNode[key] = error;

      fieldApi.isValid = !Boolean(resultErrorsNode[key]);

      if (resultErrorsNode[key]) {
        this.isValid = false;
      }
    },
  );

  // not batched changes flow
  sample({
    clock: combineEvents([field.changeError, field.errorChanged]),
    fn: ([error]) => ({ error }),
    target: changeErrorFx,
  });

  sample({
    clock: combineEvents([field.change, field.changed]),
    fn: ([value]) => ({ value }),
    target: changeValueFx,
  });

  sample({
    clock: combineEvents([field.reset, field.resetCompleted]),
    source: [field.$value, field.$error],
    fn: ([value, error]) => ({
      value,
      error,
    }),
    target: resetFx,
  });

  sample({
    clock: changeValueFx.done,
    filter: ({ params }) => !params.batchInfo,
    fn: (): FieldInteractionEventPayload => ({
      fieldPath: apiKey,
      type: 'value',
    }),
    target: this.schemaUpdated,
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
    clock: resetFx.done,
    filter: ({ params }) => !params.batchInfo,
    fn: (): FieldInteractionEventPayload => ({
      fieldPath: apiKey,
      type: 'all',
    }),
    target: this.schemaUpdated,
  });

  // batching fix (effector skips value update)
  sample({
    clock: field.batchedSetValue,
    filter: ({ value }) => value === resultValuesNode[key],
    fn: ({ '@@batchInfo': batchInfo }) => ({
      fieldPath: apiKey,
      '@@batchInfo': batchInfo,
    }),
    target: this.batchedSchemaUpdated,
  });

  // batched changes flow
  sample({
    clock: field.batchedSetInnerError,
    source: field.$outerError,
    fn: (outerError, { value: innerError, '@@batchInfo': batchInfo }) => ({
      error: outerError ?? innerError,
      batchInfo,
    }),
    target: changeErrorFx,
  });

  sample({
    clock: field.batchedSetOuterError,
    source: field.$innerError,
    fn: (innerError, { value: outerError, '@@batchInfo': batchInfo }) => ({
      error: outerError ?? innerError,
      batchInfo,
    }),
    target: changeErrorFx,
  });

  sample({
    clock: combineEvents([field.batchedSetValue, field.changed]),
    source: field.$value,
    fn: (value, [{ '@@batchInfo': batchInfo }]) => ({
      value,
      batchInfo,
    }),
    target: changeValueFx,
  });

  sample({
    clock: combineEvents([field.batchedReset, field.resetCompleted]),
    source: [field.$value, field.$error],
    fn: ([value, error], [{ '@@batchInfo': batchInfo }]) => ({
      value,
      error,
      batchInfo,
    }),
    target: resetFx,
  });

  sample({
    clock: [changeValueFx.done, changeErrorFx.done, resetFx.done],
    filter: ({ params }) => !!params.batchInfo,
    fn: ({ params }) => ({
      fieldPath: apiKey,
      '@@batchInfo': params.batchInfo!,
    }),
    target: this.batchedSchemaUpdated,
  });

  sample({
    clock: field.focused,
    fn: () => ({ fieldPath: apiKey }),
    target: this.focused,
  });

  sample({
    clock: field.blurred,
    fn: () => ({ fieldPath: apiKey }),
    target: this.blurred,
  });

  sample({
    clock: field.metaChanged,
    fn: (meta) => ({ fieldPath: apiKey, meta }),
    target: this.metaChanged,
  });
}
