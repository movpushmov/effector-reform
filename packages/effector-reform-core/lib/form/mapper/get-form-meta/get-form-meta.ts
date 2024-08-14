import { ReadyFieldsGroupSchema } from '../../../fields';
import { EventCallable } from 'effector';
import { FormApi, Node } from '../types';
import { map } from './map';
import {
  BatchedSchemaUpdatedPayload,
  FieldInteractionEventPayload,
  FieldInteractionEventPayloadBase,
  MetaChangedEventPayload,
} from '../map-schema/types';

export function getFormMeta(
  node: ReadyFieldsGroupSchema,
  metaChanged: EventCallable<MetaChangedEventPayload>,
  schemaUpdated: EventCallable<FieldInteractionEventPayload>,
  batchedSchemaUpdated: EventCallable<BatchedSchemaUpdatedPayload>,
  focused: EventCallable<FieldInteractionEventPayloadBase>,
  blurred: EventCallable<FieldInteractionEventPayloadBase>,
) {
  const values: Node = {};
  const errors: Node = {};
  const api: FormApi = {};

  const thisArg = {
    api,
    isValid: true,

    metaChanged,
    schemaUpdated,
    batchedSchemaUpdated,
    focused,
    blurred,
  };

  map.call(thisArg, node, values, errors);

  return { api, values, errors, isValid: thisArg.isValid };
}
