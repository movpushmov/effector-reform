import {
  EventCallable,
  Store,
  createEvent,
  createStore,
  sample,
  createEffect,
  clearNode,
} from 'effector';
import {
  ArrayField,
  InnerArrayFieldApi,
  InnerFieldApi,
  PrimaryField,
  ReadyFieldsGroupSchema,
  arrayFieldSymbol,
  isPrimaryValue,
  primaryFieldSymbol,
  FieldError,
} from '../../fields';
import { FormErrors, FormValues } from '../types';
import { FormApi, Node } from './types';

type FieldInteractionEventPayload = { fieldPath: string };

function getMeta(
  node: ReadyFieldsGroupSchema,
  schemaUpdated: EventCallable<void>,
  focused: EventCallable<FieldInteractionEventPayload>,
  blurred: EventCallable<FieldInteractionEventPayload>,
) {
  const values: Node = {};
  const errors: Node = {};
  const api: FormApi = {};

  let isValid = true;

  function map(
    currentNode: ReadyFieldsGroupSchema,
    resultValuesNode: Node,
    resultErrorsNode: Node,
    path: string[] = [],
  ) {
    for (const key in currentNode) {
      const subNode = currentNode[key];

      switch (subNode.type) {
        case primaryFieldSymbol: {
          const field = subNode as PrimaryField<any> & InnerFieldApi;

          resultValuesNode[key] = field.$value.getState();
          resultErrorsNode[key] = field.$error.getState();

          const apiKey = [...path, key].join('.');

          const changeValueFx = createEffect((value: any) => {
            resultValuesNode[key] = value;
          });

          const changeErrorFx = createEffect((error: FieldError) => {
            resultErrorsNode[key] = error;
          });

          sample({
            clock: field.$error,
            target: changeErrorFx,
          });

          sample({
            clock: changeErrorFx.doneData,
            fn: () => ({ fieldPath: apiKey, type: 'error' }),
            target: schemaUpdated,
          });

          if (resultErrorsNode[key]) {
            isValid = false;
          }

          sample({
            clock: field.$value,
            target: changeValueFx,
          });

          sample({
            clock: changeValueFx.doneData,
            fn: () => ({ fieldPath: apiKey }),
            target: schemaUpdated,
          });

          sample({
            clock: field.focused,
            fn: () => ({ fieldPath: apiKey }),
            target: focused,
          });

          sample({
            clock: field.blurred,
            fn: () => ({ fieldPath: apiKey, type: 'value' }),
            target: blurred,
          });

          api[apiKey] = {
            reset: field.reset,

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

          break;
        }
        case arrayFieldSymbol: {
          const field = subNode as ArrayField<any> & InnerArrayFieldApi;
          const fieldValues = field.$values.getState();
          const apiKey = [...path, key].join('.');

          resultValuesNode[key] = [];
          resultErrorsNode[key] = {
            error: null,
            errors: [],
          };

          fieldValues.map((item, index) => {
            if (!isPrimaryValue(item)) {
              resultValuesNode[key].push({});
              resultErrorsNode[key].errors.push({});

              map(
                item,
                resultValuesNode[key][index],
                resultErrorsNode[key].errors[index],
                [...path, key, index.toString()],
              );
            } else {
              resultValuesNode[key].push(item);
            }
          });

          const changeValuesFx = createEffect((values: any[]) => {
            api[apiKey].clear();

            resultValuesNode[key] = [];
            resultErrorsNode[key] = {
              error: null,
              errors: [],
            };

            values.forEach((item, index) => {
              if (!isPrimaryValue(item)) {
                resultValuesNode[key].push({});
                resultErrorsNode[key].errors.push({});

                map(
                  item,
                  resultValuesNode[key][index],
                  resultErrorsNode[key].errors[index],
                  [...path, key, index.toString()],
                );
              } else {
                resultValuesNode[key].push(item);
              }
            });
          });

          const changeErrorFx = createEffect((error: FieldError) => {
            resultErrorsNode[key].error = error;
          });

          sample({
            clock: field.$values,
            target: changeValuesFx,
          });

          sample({
            clock: field.$error,
            target: changeErrorFx,
          });

          sample({
            clock: changeValuesFx.doneData,
            fn: () => ({ fieldPath: apiKey, type: 'value' }),
            target: schemaUpdated,
          });

          sample({
            clock: changeErrorFx.doneData,
            fn: () => ({ fieldPath: apiKey, type: 'error' }),
            target: schemaUpdated,
          });

          api[apiKey] = {
            reset: field.reset,
            clearForErrors: () => {},

            clear: (fullClear) => {
              const keys = Object.keys(api)
                .filter((key) => key.startsWith(apiKey))
                .filter((key) => key !== apiKey);

              for (const subApiKey of keys) {
                api[subApiKey].clear(true);
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

          break;
        }
        default: {
          resultValuesNode[key] = {};
          resultErrorsNode[key] = {};

          map(
            subNode as ReadyFieldsGroupSchema,
            resultValuesNode[key],
            resultErrorsNode[key],
            [...path, key],
          );

          break;
        }
      }
    }
  }

  map(node, values, errors);

  return { values, errors, api, isValid, focused, blurred };
}

export function mapSchema<T extends ReadyFieldsGroupSchema>(node: T) {
  const schemaUpdated = createEvent();
  const blurred = createEvent<FieldInteractionEventPayload>();
  const focused = createEvent<FieldInteractionEventPayload>();

  const $meta = createStore(getMeta(node, schemaUpdated, focused, blurred));

  const $values: Store<FormValues<T>> = $meta.map(({ values }) => values);
  const $errors: Store<FormErrors<T>> = $meta.map(({ errors }) => errors);
  const $isValid = $meta.map(({ isValid }) => isValid);

  const $api = $meta.map(({ api }) => api);

  sample({
    clock: schemaUpdated,
    source: $meta,
    fn: (meta) => ({ ...meta }),
    target: $meta,
  });

  return { $values, $errors, $api, $isValid, focused, blurred };
}
