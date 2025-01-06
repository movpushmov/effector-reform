import { ReadyFieldsGroupSchema } from '../../../fields';
import { setupUpdating } from './setup-updating';
import { setupBatching } from './setup-batching';
import { getFormMeta } from '../get-form-meta';
import { createStore, sample } from 'effector';
import { spread } from 'patronum';
import { isFormValid } from '../../helpers';

export function mapSchema<T extends ReadyFieldsGroupSchema>(
  node: T,
  sid?: string | null,
) {
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

  const $api = createStore(meta.api, { serialize: 'ignore' });

  const $values = sid
    ? createStore(meta.values, { sid: `${sid}|form|values` })
    : createStore(meta.values);

  const $errors = sid
    ? createStore(meta.errors, { sid: `${sid}|form|errors` })
    : createStore(meta.errors);

  const $isValid = sid
    ? createStore(meta.isValid, { sid: `${sid}|form|isValid` })
    : createStore(meta.isValid);

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
            isValid: isFormValid(meta.api),
          };
        }
        case 'all': {
          return {
            values: { ...meta.values },
            api: { ...meta.api },
            errors: { ...meta.errors },
            isValid: isFormValid(meta.api),
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
