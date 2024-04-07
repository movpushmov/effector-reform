import type { ErrorsSchemaPayload } from '../types';
import type { FormApi } from '../mapper';
import { EventCallable } from 'effector';
import { BatchInfo, createBatchTask } from '../batching';

export function setFormErrors(
  errors: ErrorsSchemaPayload,
  formApi: FormApi,
  addBatchTask: EventCallable<BatchInfo>,
  mode: 'inner' | 'outer',
) {
  if (Object.keys(errors).length === 0) {
    return;
  }

  const task = createBatchTask(Object.keys(errors), 'errors');
  addBatchTask(task);

  for (const apiKey in errors) {
    const fieldApi = formApi[apiKey];

    if (!fieldApi) {
      console.error(`Unknown field with path: ${apiKey}`);
      continue;
    }

    switch (mode) {
      case 'inner': {
        fieldApi.batchedSetInnerError({
          value: errors[apiKey],
          '@@batchInfo': { id: task.id, fieldPath: apiKey },
        });
        break;
      }
      case 'outer': {
        fieldApi.batchedSetOuterError({
          value: errors[apiKey],
          '@@batchInfo': { id: task.id, fieldPath: apiKey },
        });
        break;
      }
    }
  }
}
