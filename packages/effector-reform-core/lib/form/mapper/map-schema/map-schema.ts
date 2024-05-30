import { ReadyFieldsGroupSchema } from '../../../fields';
import { setupUpdating } from './setup-updating';
import { setupBatching } from './setup-batching';
import { getFormMeta } from '../get-form-meta';
import { createStore, sample } from 'effector';
import { spread } from 'patronum';

export function mapSchema<T extends ReadyFieldsGroupSchema>(node: T) {
  const { schemaUpdated, focused, blurred, metaChanged } = setupUpdating();
  const { batchedSchemaUpdated, addBatchTask } = setupBatching(schemaUpdated);

  const meta = getFormMeta(
    node,
    metaChanged,
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
    fn: (payload) => {
      switch (payload.type) {
        case 'value': {
          return {
            values: { ...meta.values },
            api: { ...meta.api },
          };
        }
        case 'error': {
          return {
            errors: { ...meta.errors },
            isValid: meta.isValid,
          };
        }
        case 'all': {
          return {
            values: { ...meta.values },
            api: { ...meta.api },
            errors: { ...meta.errors },
            isValid: meta.isValid,
          };
        }
        case 'none': {
          return {};
        }
      }
    },
    target: spread({
      api: $api,
      values: $values,
      errors: $errors,
      isValid: $isValid,
    }),
  });

  return {
    $api,
    $values,
    $errors,
    $isValid,
    addBatchTask,
    focused,
    blurred,
    metaChanged,
  };
}
