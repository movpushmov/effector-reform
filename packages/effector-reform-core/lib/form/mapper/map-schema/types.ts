export type FieldInteractionEventPayload = { fieldPath: string };
export type BatchedSchemaUpdatedPayload = FieldInteractionEventPayload & {
  '@@batchInfo': { id: string };
};
