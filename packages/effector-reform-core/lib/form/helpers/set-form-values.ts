import { isPrimaryValue } from '../../fields';
import type { FormApi, Node } from '../mapper';
import { EventCallable } from 'effector';
import { createBatchTask, BatchInfo } from '../batching';

export function setFormValues<Values>(
  values: Values,
  formApi: FormApi,
  addBatchTask: EventCallable<BatchInfo>,
) {
  const iteratedValues: Record<
    string,
    { event: FormApi[string]['batchedSetValue']; value: any }
  > = {};

  function iterate(node: Node, path: string[] = []) {
    for (const key in node) {
      const subNode = node[key];
      const apiKey = [...path, key].join('.');

      if (isPrimaryValue(subNode) || Array.isArray(subNode)) {
        const fieldApi = formApi[apiKey];

        if (!fieldApi) {
          console.error(`Unknown field with path: ${apiKey}`);
          continue;
        }

        iteratedValues[apiKey] = {
          event: fieldApi.batchedSetValue,
          value: subNode,
        };
        continue;
      }

      if (typeof subNode === 'object') {
        iterate(subNode, [...path, key]);
      }
    }
  }

  iterate(values);

  if (Object.keys(iteratedValues).length === 0) {
    return;
  }

  const task = createBatchTask(Object.keys(iteratedValues), 'values');
  addBatchTask(task);

  for (const apiKey in iteratedValues) {
    iteratedValues[apiKey].event({
      value: iteratedValues[apiKey].value,
      '@@batchInfo': { id: task.id, fieldPath: apiKey },
    });
  }
}
