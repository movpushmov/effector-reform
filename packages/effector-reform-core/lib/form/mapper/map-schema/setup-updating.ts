import { createEvent } from 'effector';
import {
  FieldInteractionEventPayload,
  FieldInteractionEventPayloadBase,
} from './types';

export function setupUpdating() {
  const schemaUpdated =
    createEvent<FieldInteractionEventPayload>('<schema updated>');

  const blurred = createEvent<FieldInteractionEventPayloadBase>('<blurred>');
  const focused = createEvent<FieldInteractionEventPayloadBase>('<focused>');

  return { blurred, focused, schemaUpdated };
}
