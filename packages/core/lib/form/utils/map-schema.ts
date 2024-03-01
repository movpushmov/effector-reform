import {
  EventCallable,
  Store,
  createEffect,
  createEvent,
  createStore,
  sample,
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

  function mapValues(
    currentNode: ReadyFieldsGroupSchema,
    resultNode: Node,
    path: string[] = [],
  ) {
    for (const key in currentNode) {
      const subNode = currentNode[key];

      switch (subNode.type) {
        case primaryFieldSymbol: {
          const field = subNode as PrimaryField<any> & InnerFieldApi;
          resultNode[key] = field.$value.getState();

          const apiKey = [...path, key].join('.');

          sample({
            clock: [field.$value, field.$error],
            target: schemaUpdated,
          });

          sample({
            clock: field.focused,
            fn: () => ({ fieldPath: apiKey }),
            target: focused,
          });

          sample({
            clock: field.blurred,
            fn: () => ({ fieldPath: apiKey }),
            target: blurred,
          });

          api[apiKey] = {
            reset: field.reset,

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

          resultNode[key] = [];

          fieldValues.map((item, index) => {
            if (!isPrimaryValue(item)) {
              resultNode[key].push({});

              mapValues(item, resultNode[key][index], [
                ...path,
                key,
                index.toString(),
              ]);
            } else {
              resultNode[key].push(item);
            }
          });

          sample({
            clock: [field.$values, field.$error],
            target: schemaUpdated,
          });

          api[apiKey] = {
            reset: field.reset,

            clearInnerError: field.setInnerError.prepend(() => null),
            clearOuterError: field.changeError.prepend(() => null),

            setInnerError: field.setInnerError,
            setOuterError: field.changeError,

            setValue: field.change,
          };

          break;
        }
        default: {
          resultNode[key] = {};

          mapValues(subNode as ReadyFieldsGroupSchema, resultNode[key], [
            ...path,
            key,
          ]);

          break;
        }
      }
    }
  }

  function mapErrors(
    currentNode: ReadyFieldsGroupSchema,
    resultNode: Node,
    path: string[] = [],
  ) {
    for (const key in currentNode) {
      const subNode = currentNode[key];

      switch (subNode.type) {
        case primaryFieldSymbol: {
          resultNode[key] = subNode.$error.getState();

          if (resultNode[key]) {
            isValid = false;
          }

          break;
        }
        case arrayFieldSymbol: {
          const field = subNode as ArrayField<any> & InnerArrayFieldApi;
          const fieldValues = field.$values.getState();

          resultNode[key] = {
            error: field.$error.getState(),
            errors: [],
          };

          if (resultNode[key].error) {
            isValid = false;
          }

          fieldValues.map((item, index) => {
            if (!isPrimaryValue(item)) {
              resultNode[key].errors.push({});

              mapErrors(item, resultNode[key].errors[index], [
                ...path,
                key,
                index.toString(),
              ]);
            }
          });

          break;
        }
        default: {
          resultNode[key] = {};

          mapErrors(subNode as ReadyFieldsGroupSchema, resultNode[key], [
            ...path,
            key,
          ]);

          break;
        }
      }
    }
  }

  mapValues(node, values);
  mapErrors(node, errors);

  return { values, errors, api, isValid, focused, blurred };
}

export function mapSchema<T extends ReadyFieldsGroupSchema>(node: T) {
  const schemaUpdated = createEvent();
  const blurred = createEvent<FieldInteractionEventPayload>();
  const focused = createEvent<FieldInteractionEventPayload>();

  const getMetaFx = createEffect(() => {
    return getMeta(node, schemaUpdated, focused, blurred);
  });

  const $meta = createStore(getMeta(node, schemaUpdated, focused, blurred));

  const $values: Store<FormValues<T>> = $meta.map(({ values }) => values);
  const $errors: Store<FormErrors<T>> = $meta.map(({ errors }) => errors);
  const $isValid = $meta.map(({ isValid }) => isValid);

  const $api = $meta.map(({ api }) => api);

  sample({
    clock: schemaUpdated,
    target: getMetaFx,
  });

  sample({
    clock: getMetaFx.doneData,
    target: $meta,
  });

  return { $values, $errors, $api, $isValid, focused, blurred };
}
