import { createEvent, createStore, EventCallable, sample } from 'effector';
import { BatchInfo } from '../../batching';
import {
  BatchedSchemaUpdatedPayload,
  FieldInteractionEventPayload,
} from './types';
import { getCompletedBatchTasks } from '../../batching';

export function setupBatching(
  schemaUpdated: EventCallable<FieldInteractionEventPayload>,
) {
  const $tasks = createStore<Record<string, BatchInfo>>(
    {},
    {
      name: '<batch info>',
    },
  );

  const batchedSchemaUpdated = createEvent<BatchedSchemaUpdatedPayload>();
  const addBatchTask = createEvent<BatchInfo>('<add batch task>');

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
    filter: (tasks) => getCompletedBatchTasks(tasks).tasks.length > 0,
    fn: (tasks) => {
      const { tasks: completed, updateType } = getCompletedBatchTasks(tasks);

      return {
        fieldPath: completed.map((t) => t.fields).join(' '),
        type: updateType,
      };
    },
    target: schemaUpdated,
  });

  sample({
    clock: $tasks,
    fn: (tasks) => {
      const { tasks: completed } = getCompletedBatchTasks(tasks);

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
