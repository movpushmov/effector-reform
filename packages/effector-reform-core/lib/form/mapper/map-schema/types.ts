export type FieldInteractionEventPayloadBase = {
  fieldPath: string;
};

export type FieldInteractionEventPayload = FieldInteractionEventPayloadBase & {
  type: 'error' | 'value' | 'all' | 'none';
};

export type BatchedSchemaUpdatedPayload = FieldInteractionEventPayloadBase & {
  '@@batchInfo': { id: string };
};

export type MetaChangedEventPayload = FieldInteractionEventPayloadBase & {
  meta: any;
};
