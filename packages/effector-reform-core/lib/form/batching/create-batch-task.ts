import { BatchInfo } from './types';

export function createBatchTask(
  fields: string[],
  type: 'errors' | 'values' | 'all',
): BatchInfo {
  return {
    id: Math.random().toString(),
    type,
    fields,
  };
}
