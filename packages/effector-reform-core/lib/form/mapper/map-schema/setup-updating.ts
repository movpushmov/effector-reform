import { createEvent } from 'effector';
import {
  FieldInteractionEventPayload,
  FieldInteractionEventPayloadBase,
  MetaChangedEventPayload,
} from './types';

export function setupUpdating() {
  const schemaUpdated =
    createEvent<FieldInteractionEventPayload>('<schema updated>');

  const blurred = createEvent<FieldInteractionEventPayloadBase>('<blurred>');
  const focused = createEvent<FieldInteractionEventPayloadBase>('<focused>');
  const metaChanged = createEvent<MetaChangedEventPayload>();

  return { blurred, focused, schemaUpdated, metaChanged };
}
