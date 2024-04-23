import {
  ArrayField,
  FieldError,
  InnerArrayFieldApi,
  isPrimitiveValue,
} from '../../../fields';
import { clearNode, createEffect, sample } from 'effector';
import { Node } from '../types';
import { MapFn, This } from './types';
import { FieldInteractionEventPayload } from '../map-schema/types';

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
      this.api[apiKey].clear();

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

  sample({
    clock: field.notBatchedErrorChanged,
    fn: (error) => ({ error }),
    target: changeErrorFx,
  });

  sample({
    clock: field.notBatchedValueChanged,
    fn: (values) => ({ values }),
    target: changeValuesFx,
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
      values: value,
      batchInfo,
    }),
    target: changeValuesFx,
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
    clock: [changeValuesFx.done, changeErrorFx.done],
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
    reset: field.reset,

    batchedSetValue: field.batchedSetValue,
    batchedSetOuterError: field.batchedSetOuterError,
    batchedSetInnerError: field.batchedSetInnerError,

    clearForErrors: () => {},

    clear: (fullClear) => {
      const keys = Object.keys(this.api)
        .filter((key) => key.startsWith(apiKey))
        .filter((key) => key !== apiKey);

      for (const subApiKey of keys) {
        this.api[subApiKey].clear(true);
        this.api[subApiKey].clearForErrors();
      }

      if (fullClear) {
        clearNode(changeValuesFx);
      }
    },

    clearInnerError: field.setInnerError.prepend(() => null),
    clearOuterError: field.changeError.prepend(() => null),

    setInnerError: field.setInnerError,
    setOuterError: field.changeError,

    setValue: field.change,
  };
}
