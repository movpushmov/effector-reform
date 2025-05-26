import { FieldError, InnerFieldApi, PrimitiveField } from '../../../fields';
import {
  createEffect,
  sample,
  clearNode,
  createNode,
  withRegion,
} from 'effector';
import { Node, PrimitiveFieldPathApi } from '../types';
import { This } from './types';
import { FieldInteractionEventPayload } from '../map-schema/types';
import { inOrder } from '../../../utils';

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
  const region = createNode({ regional: true });
  const field = rawField as PrimitiveField & InnerFieldApi;

  const value = field.$value.getState();
  const error = field.$error.getState();

  resultValuesNode[key] = value;
  resultErrorsNode[key] = error;

  const apiKey = [...path, key].join('.');

  const fieldApi: PrimitiveFieldPathApi = {
    type: 'primitive-field',
    isValid: !Boolean(resultErrorsNode[key]),

    value,
    error,

    reset: field.reset,

    clearMemory: (withField = false) => {
      if (withField) {
        clearNode(field.region);
      }

      clearNode(region);
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

  withRegion(region, () => {
    const changeValueFx = createEffect(
      ({ value }: { value: any; batchInfo?: { id: string } }) => {
        resultValuesNode[key] = value;
        fieldApi.value = value;
      },
    );

    const changeErrorFx = createEffect(
      ({ error }: { error: FieldError; batchInfo?: { id: string } }) => {
        resultErrorsNode[key] = error;
        fieldApi.value = error;

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

        fieldApi.value = value;
        fieldApi.value = error;

        fieldApi.isValid = !Boolean(resultErrorsNode[key]);

        if (resultErrorsNode[key]) {
          this.isValid = false;
        }
      },
    );

    // not batched changes flow
    sample({
      clock: inOrder([field.changeError, field.errorChanged]),
      fn: ([error]) => ({ error }),
      target: changeErrorFx,
    });

    sample({
      clock: inOrder([field.change, field.changed]),
      fn: ([value]) => ({ value }),
      target: changeValueFx,
    });

    sample({
      clock: inOrder([field.reset, field.resetCompleted]),
      fn: ([, { value, error }]) => ({
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
      clock: inOrder([field.batchedSetValue, field.changed]),
      source: field.$value,
      fn: (value, [{ '@@batchInfo': batchInfo }]) => ({
        value,
        batchInfo,
      }),
      target: changeValueFx,
    });

    sample({
      clock: inOrder([field.batchedReset, field.resetCompleted]),
      fn: ([{ '@@batchInfo': batchInfo }, { value, error }]) => ({
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
  });
}
