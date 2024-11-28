import { FormApi } from '../mapper';
import { BatchInfo, createBatchTask } from '../batching';
import { EventCallable } from 'effector';

export function resetForm(
  formApi: FormApi,
  addBatchTask: EventCallable<BatchInfo>,
) {
  const keys = Object.keys(formApi).filter((key) => !/\.[0-9]\./.test(key));
  const task = createBatchTask(keys, 'reset');

  addBatchTask(task);

  for (const apiKey of keys) {
    const api = formApi[apiKey];

    api.batchedReset({ '@@batchInfo': { fieldPath: apiKey, id: task.id } });
  }
}
