import { FieldError, InnerFieldApi, PrimitiveField } from '../../../fields';
import { createEffect, sample } from 'effector';
import { Node } from '../types';
import { This } from './types';
import { FieldInteractionEventPayload } from '../map-schema/types';
import { combineEvents, spread } from 'patronum';
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
    clock: [combineEvents([field.reset, field.resetCompleted])],
    source: [field.$value, field.$error],
    fn: ([value, error]) => ({
      value: { value },
      error: { error },
    }),
    target: spread({
      value: changeValueFx,
      error: changeErrorFx,
    }),
  });

  // not batched update field samples
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

  // batched changes flow
  sample({
    clock: combineEvents([field.batchedSetInnerError, field.errorChanged]),
    source: field.$error,
    fn: (error, [{ '@@batchInfo': batchInfo }]) => ({
      error,
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
    clock: [combineEvents([field.batchedReset, field.resetCompleted])],
    source: [field.$value, field.$error],
    fn: ([value, error], [{ '@@batchInfo': batchInfo }]) => ({
      value: { value, batchInfo },
      error: { error, batchInfo },
    }),
    target: spread({
      value: changeValueFx,
      error: changeErrorFx,
    }),
  });

  sample({
    clock: [changeValueFx.done, changeErrorFx.done],
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

  this.api[apiKey] = {
    type: 'primitive-field',

    reset: field.reset,

    clearMemory: () => {
      clearPrimitiveFieldMemory(field, true);
      clearUnits([changeValueFx, changeErrorFx], true);
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
}
