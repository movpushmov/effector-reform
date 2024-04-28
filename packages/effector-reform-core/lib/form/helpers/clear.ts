import type { FormApi } from '../mapper';
import { createBatchTask } from '../batching';

export function clearFormErrors(formApi: FormApi, mode: 'inner' | 'outer') {
  const keys = Object.keys(formApi);
  const task = createBatchTask(keys, 'errors');

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
