import { ReadyFieldsGroupSchema } from '../../../fields';
import { FormApi, Node } from '../types';
import { EventCallable } from 'effector';
import {
  BatchedSchemaUpdatedPayload,
  FieldInteractionEventPayload,
} from '../map-schema/types';

export type MapFn = (
  currentNode: ReadyFieldsGroupSchema,
  resultValuesNode: Node,
  resultErrorsNode: Node,
  path?: string[],
) => void;

export interface This {
  schemaUpdated: EventCallable<FieldInteractionEventPayload>;
  batchedSchemaUpdated: EventCallable<BatchedSchemaUpdatedPayload>;
  focused: EventCallable<FieldInteractionEventPayload>;
  blurred: EventCallable<FieldInteractionEventPayload>;

  api: FormApi;
  isValid: boolean;
}
