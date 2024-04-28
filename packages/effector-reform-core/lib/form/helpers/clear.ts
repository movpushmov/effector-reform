import type { FormApi } from '../mapper';
import { BatchInfo, createBatchTask } from '../batching';
import { EventCallable } from 'effector';

export function clearFormErrors(
  formApi: FormApi,
  addBatchTask: EventCallable<BatchInfo>,
  mode: 'inner' | 'outer',
) {
  const keys = Object.keys(formApi);
  const task = createBatchTask(keys, 'errors');

  addBatchTask(task);

  for (const apiKey of keys) {
    const api = formApi[apiKey];

    if (mode === 'inner') {
      api.batchedSetInnerError({
        value: null,
        '@@batchInfo': { fieldPath: apiKey, id: task.id },
      });
    } else if (mode === 'outer') {
      api.batchedSetOuterError({
        value: null,
        '@@batchInfo': { fieldPath: apiKey, id: task.id },
      });
    }
  }
}
