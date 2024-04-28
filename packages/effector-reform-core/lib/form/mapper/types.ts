import {
  FieldBatchedPayload,
  FieldBatchedSetter,
  FieldError,
} from '../../fields';

export type Node = any;

export type BasePathApi = {
  reset: () => void;

  clearInnerError: () => void;
  clearOuterError: () => void;

  setInnerError: (error: FieldError) => void;
  setOuterError: (error: FieldError) => void;

  setValue: <T>(value: T) => void;

  batchedSetValue: <T>(info: FieldBatchedSetter<T>) => void;
  batchedSetInnerError: (error: FieldBatchedSetter<FieldError>) => void;
  batchedSetOuterError: (error: FieldBatchedSetter<FieldError>) => void;
  batchedReset: (info: FieldBatchedPayload) => void;
};

export type ArrayFieldPathApi = {
  type: 'array-field';

  clearValuesMemory: () => void;
  clearMemory: () => void;

  clear: () => void;
  batchedClear: (info: FieldBatchedPayload) => void;
} & BasePathApi;

export type PrimitiveFieldPathApi = {
  type: 'primitive-field';

  clearMemory: () => void;
} & BasePathApi;

export type PathApi = ArrayFieldPathApi | PrimitiveFieldPathApi;

export type FormApi = Record<string, PathApi>;
