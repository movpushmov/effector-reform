import { FieldError } from '../../fields';

export type Node = any;

export type PathApi = {
  reset: () => void;
  clear: (fullClear?: boolean) => void;
  clearForErrors: () => void;

  clearInnerError: () => void;
  clearOuterError: () => void;

  setInnerError: (error: FieldError) => void;
  setOuterError: (error: FieldError) => void;

  setValue: <T>(value: T) => void;
};

export type FormApi = Record<string, PathApi>;
