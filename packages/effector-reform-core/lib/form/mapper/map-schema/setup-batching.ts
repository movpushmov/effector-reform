import { createEvent, createStore, EventCallable, sample } from 'effector';
import { BatchInfo } from '../../batching';
import { BatchedSchemaUpdatedPayload } from './types';
import { getCompletedBatchTasks } from '../../batching';

export function setupBatching(schemaUpdated: EventCallable<any>) {
  const $tasks = createStore<Record<string, BatchInfo>>(
    {},
    {
      name: '<batch info>',
    },
  );

  const batchedSchemaUpdated = createEvent<BatchedSchemaUpdatedPayload>();
  const addBatchTask = createEvent<BatchInfo>('<start batch>');

  sample({
    clock: addBatchTask,
    source: $tasks,
    fn: (tasks, newTask) => ({ ...tasks, [newTask.id]: newTask }),
    target: $tasks,
  });

  sample({
    clock: batchedSchemaUpdated,
    source: $tasks,
    fn: (tasks, { fieldPath, '@@batchInfo': info }) => {
      const task = tasks[info.id];
      task.fields = task.fields.filter((f) => f !== fieldPath);

      return { ...tasks };
    },
    target: $tasks,
  });

  sample({
    clock: $tasks,
    filter: (tasks) => getCompletedBatchTasks(tasks).length > 0,
    target: schemaUpdated,
  });

  sample({
    clock: $tasks,
    fn: (tasks) => {
      const completed = getCompletedBatchTasks(tasks);

      if (completed.length === 0) {
        return tasks;
      }

      const updatedList = { ...tasks };

      for (const task of completed) {
        delete updatedList[task.id];
      }

      return updatedList;
    },
    target: $tasks,
  });

  return { addBatchTask, batchedSchemaUpdated };
}
