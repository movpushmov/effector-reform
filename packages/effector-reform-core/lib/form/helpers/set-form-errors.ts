import type { ErrorsSchemaPayload } from '../types';
import type { FormApi } from '../mapper';
import { EventCallable } from 'effector';
import { BatchInfo, createBatchTask } from '../batching';

export function setFormErrors(
  errors: ErrorsSchemaPayload,
  formApi: FormApi,
  addBatchTask: EventCallable<BatchInfo>,
  mode: 'inner' | 'outer',
  clearOtherFields: boolean = false,
) {
  const allFieldsKeys = Object.keys(formApi);
  const fieldsToSet = clearOtherFields ? allFieldsKeys : Object.keys(errors);

  if (Object.keys(fieldsToSet).length === 0) {
    return;
  }

  const task = createBatchTask(fieldsToSet, 'errors');
  addBatchTask(task);

  for (const apiKey of fieldsToSet) {
    const fieldApi = formApi[apiKey];

    if (!fieldApi) {
      console.error(`Unknown field with path: ${apiKey}`);
      continue;
    }

    switch (mode) {
      case 'inner': {
        fieldApi.batchedSetInnerError({
          value: errors[apiKey] ?? null,
          '@@batchInfo': { id: task.id, fieldPath: apiKey },
        });
        break;
      }
      case 'outer': {
        fieldApi.batchedSetOuterError({
          value: errors[apiKey] ?? null,
          '@@batchInfo': { id: task.id, fieldPath: apiKey },
        });
        break;
      }
    }
  }
}
