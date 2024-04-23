import { FieldError, InnerFieldApi, PrimitiveField } from '../../../fields';
import { clearNode, createEffect, sample } from 'effector';
import { Node } from '../types';
import { This } from './types';
import { FieldInteractionEventPayload } from '../map-schema/types';

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

  sample({
    clock: field.notBatchedErrorChanged,
    fn: (error) => ({ error }),
    target: changeErrorFx,
  });

  sample({
    clock: field.notBatchedValueChanged,
    fn: (value) => ({ value }),
    target: changeValueFx,
  });

  sample({
    clock: field.batchedErrorChanged,
    fn: ({ value: error, '@@batchInfo': batchInfo }) => ({
      error,
      batchInfo,
    }),
    target: changeErrorFx,
  });

  sample({
    clock: field.batchedValueChanged,
    fn: ({ value, '@@batchInfo': batchInfo }) => ({
      value,
      batchInfo,
    }),
    target: changeValueFx,
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
    clock: [changeValueFx.done, changeErrorFx.done],
    filter: ({ params }) => !!params.batchInfo,
    fn: ({ params }) => ({
      fieldPath: apiKey,
      '@@batchInfo': params.batchInfo!,
    }),
    target: this.batchedSchemaUpdated,
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
    clock: field.focused,
    fn: () => ({ fieldPath: apiKey }),
    target: this.focused,
  });

  sample({
    clock: field.blurred,
    fn: () => ({ fieldPath: apiKey, type: 'value' }),
    target: this.blurred,
  });

  this.api[apiKey] = {
    reset: field.reset,

    batchedSetValue: field.batchedSetValue,
    batchedSetOuterError: field.batchedSetOuterError,
    batchedSetInnerError: field.batchedSetInnerError,

    clearForErrors: () => {
      clearNode(changeErrorFx);
    },

    clear: () => {
      clearNode(changeValueFx);
    },

    clearInnerError: field.setInnerError.prepend(() => null),
    clearOuterError: field.changeError.prepend(() => null),

    setInnerError: field.setInnerError,
    setOuterError: field.changeError,

    setValue: field.change,
  };
}
