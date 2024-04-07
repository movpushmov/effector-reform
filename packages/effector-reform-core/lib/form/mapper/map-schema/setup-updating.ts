import { createEvent } from 'effector';
import { FieldInteractionEventPayload } from './types';

export function setupUpdating() {
  const schemaUpdated =
    createEvent<FieldInteractionEventPayload>('<schema updated>');

  const blurred = createEvent<FieldInteractionEventPayload>('<blurred>');
  const focused = createEvent<FieldInteractionEventPayload>('<focused>');

  return { blurred, focused, schemaUpdated };
}
