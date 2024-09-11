import { BatchInfo } from './types';
import { FieldInteractionEventPayload } from '../mapper/map-schema/types';

export function getCompletedBatchTasks(tasks: Record<string, BatchInfo>) {
  return Object.values(tasks).reduce<{
    tasks: BatchInfo[];
    updateType: FieldInteractionEventPayload['type'];
  }>(
    (acc, info) => {
      if (info.fields.length > 0) {
        return acc;
      }

      acc.tasks.push(info);

      if (info.type === 'values' && acc.updateType !== 'all') {
        acc.updateType = acc.updateType === 'error' ? 'all' : 'value';
      } else if (info.type === 'errors' && acc.updateType !== 'all') {
        acc.updateType = acc.updateType === 'value' ? 'all' : 'error';
      } else if (info.type === 'reset' || info.type === 'all') {
        acc.updateType = 'all';
      }

      return acc;
    },
    { tasks: [], updateType: 'none' },
  );
}
