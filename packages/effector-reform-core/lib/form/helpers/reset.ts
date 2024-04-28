import { FormApi } from '../mapper';
import { createBatchTask } from '../batching';

export function resetForm(formApi: FormApi) {
  const keys = Object.keys(formApi);
  const task = createBatchTask(keys, 'all');

  for (const apiKey of keys) {
    const api = formApi[apiKey];

    api.batchedReset({ '@@batchInfo': { fieldPath: apiKey, id: task.id } });
  }
}
