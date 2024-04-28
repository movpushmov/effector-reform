export type BatchInfo = {
  fields: string[];
  id: string;
  type: 'values' | 'errors' | 'reset' | 'all';
};
