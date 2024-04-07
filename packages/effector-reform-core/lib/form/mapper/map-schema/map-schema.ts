import { ReadyFieldsGroupSchema } from '../../../fields';
import { setupUpdating } from './setup-updating';
import { setupBatching } from './setup-batching';
import { getMeta } from '../get-meta';
import { createStore, sample } from 'effector';
import { spread } from 'patronum';

export function mapSchema<T extends ReadyFieldsGroupSchema>(node: T) {
  const { schemaUpdated, focused, blurred } = setupUpdating();
  const { batchedSchemaUpdated, addBatchTask } = setupBatching(schemaUpdated);

  const meta = getMeta(
    node,
    schemaUpdated,
    batchedSchemaUpdated,
    focused,
    blurred,
  );

  const $api = createStore(meta.api);
  const $values = createStore(meta.values);
  const $errors = createStore(meta.errors);
  const $isValid = createStore(meta.isValid);

  sample({
    clock: schemaUpdated,
    fn: () => ({
      api: { ...meta.api },
      values: { ...meta.values },
      errors: { ...meta.errors },
      isValid: meta.isValid,
    }),
    target: spread({
      api: $api,
      values: $values,
      errors: $errors,
      isValid: $isValid,
    }),
  });

  return { $api, $values, $errors, $isValid, addBatchTask, focused, blurred };
}
