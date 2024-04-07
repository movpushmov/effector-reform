import { BatchInfo } from './types';

export function getCompletedBatchTasks(tasks: Record<string, BatchInfo>) {
  return Object.values(tasks).reduce<BatchInfo[]>((acc, info) => {
    if (info.fields.length === 0) {
      acc.push(info);
    }

    return acc;
  }, []);
}
