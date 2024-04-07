import {
  ArrayField,
  FieldError,
  InnerArrayFieldApi,
  isPrimaryValue,
} from '../../../fields';
import { clearNode, createEffect, sample } from 'effector';
import { Node } from '../types';
import { MapFn, This } from './types';
import { combineEventsInOrder } from '../../../utils';

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
      if (!isPrimaryValue(item)) {
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

  const { target: batchedErrorChanged, clear: clearBatchedSetError } =
    combineEventsInOrder([field.batchedErrorChanged, field.errorChanged]);

  const { target: batchedValuesChanged, clear: clearBatchedSetValues } =
    combineEventsInOrder([field.batchedSetValue, field.changed]);

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
    clock: batchedErrorChanged,
    fn: ([{ value: error, '@@batchInfo': batchInfo }]) => ({
      error,
      batchInfo,
    }),
    target: changeErrorFx,
  });

  sample({
    clock: batchedValuesChanged,
    fn: ([{ value, '@@batchInfo': batchInfo }]) => ({
      values: value,
      batchInfo,
    }),
    target: changeValuesFx,
  });

  sample({
    clock: changeErrorFx.done,
    filter: ({ params }) => !params.batchInfo,
    fn: () => ({ fieldPath: apiKey, type: 'error' }),
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
    fn: () => ({ fieldPath: apiKey }),
    target: this.schemaUpdated,
  });

  this.api[apiKey] = {
    reset: field.reset,

    batchedSetValue: field.batchedSetValue,
    batchedSetOuterError: field.batchedSetOuterError,
    batchedSetInnerError: field.batchedSetInnerError,

    clearForErrors: () => {
      clearBatchedSetError();
    },

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
        clearBatchedSetValues();
      }
    },

    clearInnerError: field.setInnerError.prepend(() => null),
    clearOuterError: field.changeError.prepend(() => null),

    setInnerError: field.setInnerError,
    setOuterError: field.changeError,

    setValue: field.change,
  };
}
