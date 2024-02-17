import { createEffect, createEvent, createStore, sample } from 'effector';
import {
  ArrayFieldItem,
  PrimaryValue,
  ReadyFieldsGroupSchema,
  UserFormSchema,
  arrayFieldSymbol,
  primaryFieldSymbol,
} from '../fields';
import {
  AnyFieldApi,
  FormErrors,
  FormFields,
  FormValues,
  WatchSchemaResult,
  OnNodeHandlers,
} from './types';

export function watchSchema<T extends ReadyFieldsGroupSchema>(
  formSchema: T,
): WatchSchemaResult<T> {
  let values = {} as FormValues<T>;
  let errors = {} as FormErrors<T>;

  const changeValues = createEvent<FormValues<T>>('change values');
  const changeErrors = createEvent<FormErrors<T>>();

  values = getValues({ formSchema });
  errors = getErrors({ formSchema });

  const $values = createStore(values);
  const $errors = createStore(errors);

  getValues({
    formSchema,
    handlers: {
      onArrayField: (node, path) => {
        const changeValuesFx = createEffect((value: ArrayFieldItem[]) => {
          const valuesCopy = { ...$values.getState() };

          const rootPath = [...path];
          const nodeKey = rootPath.pop()!;

          const valuesNode = getObjectNode(valuesCopy, rootPath);

          if (!valuesNode) {
            throw new Error();
          }

          valuesNode[nodeKey] = value;

          return valuesCopy;
        });

        sample({
          clock: node.$values,
          target: changeValuesFx,
        });

        sample({
          clock: changeValuesFx.doneData,
          target: changeValues,
        });
      },
      onPrimaryField: (node, path) => {
        const changeValueFx = createEffect((value: PrimaryValue) => {
          const valuesCopy = { ...$values.getState() };

          const rootPath = [...path];
          const nodeKey = rootPath.pop()!;

          const valueNode = getObjectNode(valuesCopy, rootPath);

          if (!valueNode) {
            throw new Error();
          }
          valueNode[nodeKey] = value;

          return valuesCopy;
        });

        sample({
          clock: node.$value,
          target: changeValueFx,
        });

        sample({
          clock: changeValueFx.doneData,
          target: changeValues,
        });
      },
    },
  });

  getErrors({
    formSchema,
    handlers: {
      onPrimaryField: (node, path) => {
        const changeErrorFx = createEffect((error: string | null) => {
          const errorsCopy = { ...$errors.getState() };

          const rootPath = [...path];
          const nodeKey = rootPath.pop()!;

          const errorNode = getObjectNode(errorsCopy, rootPath);

          if (!errorNode) {
            throw new Error();
          }

          errorNode[nodeKey] = error;

          return errorsCopy;
        });

        sample({
          clock: node.$error,
          target: changeErrorFx,
        });

        sample({
          clock: changeErrorFx.doneData,
          target: changeErrors,
        });
      },
    },
  });

  sample({
    clock: changeValues,
    target: $values,
  });

  sample({
    clock: changeErrors,
    target: $errors,
  });

  return { $values, $errors };
}

interface WalkerProps<T extends ReadyFieldsGroupSchema> {
  formSchema: T;
  path?: string[];
  handlers?: OnNodeHandlers;
}

function getValues<T extends ReadyFieldsGroupSchema>({
  formSchema,
  handlers,
  path = [],
}: WalkerProps<T>): FormValues<T> {
  const result: UserFormSchema<any> = {};

  for (const key in formSchema) {
    const node = formSchema[key];

    switch (node.type) {
      case arrayFieldSymbol: {
        result[key] = node.$values.getState();
        handlers?.onArrayField?.(node, [...path, key]);

        break;
      }
      case primaryFieldSymbol: {
        result[key] = node.$value.getState();
        handlers?.onPrimaryField?.(node, [...path, key]);

        break;
      }
      case undefined: {
        result[key] = getValues({
          formSchema: node,
          path: [...path, key],
          handlers,
        });

        break;
      }
    }
  }

  return result;
}

function getErrors<T extends ReadyFieldsGroupSchema>({
  formSchema,
  handlers,
  path = [],
}: WalkerProps<T>): FormErrors<T> {
  const result: UserFormSchema<any> = {};

  for (const key in formSchema) {
    const node = formSchema[key];

    switch (node.type) {
      case arrayFieldSymbol: {
        result[key] = node.$values.getState();
        handlers?.onArrayField?.(node, [...path, key]);

        break;
      }
      case primaryFieldSymbol: {
        result[key] = node.$value.getState();
        handlers?.onPrimaryField?.(node, [...path, key]);

        break;
      }
      case undefined: {
        result[key] = getErrors({
          formSchema: node,
          path: [...path, key],
          handlers,
        });

        break;
      }
    }
  }

  return result;
}

export function getValue(
  path: string,
  node: FormFields,
): PrimaryValue | FormFields[] {
  const field = getField(path.split('.'), node, path);

  switch (field.type) {
    case primaryFieldSymbol: {
      return field.$value.getState();
    }
    case arrayFieldSymbol: {
      return field.$values.getState();
    }
    default: {
      throw new Error(`Unknown field type. Received: ${field}`);
    }
  }
}

export type ObjectNode = FormValues<any> | FormErrors<any>;
export type Node = ObjectNode | ArrayFieldItem[] | PrimaryValue | string | null;

export function getNode<T extends Node>(node: T, path: string[]): Node {
  if (path.length === 0) {
    return node;
  }

  if (!node) {
    throw new Error(
      `Node is null or undefined, but path is not empty: ${path.join(' ')}`,
    );
  }

  if (node instanceof Date) {
    throw new Error(`Node is Date, but path is not empty: ${path.join(' ')}`);
  }

  if (Array.isArray(node)) {
    const key = path.pop()!;

    if (!/\[\d+\]/.test(key)) {
      throw new Error(
        `Node is array, but next path key is not array indexer in [number] format. ${key}`,
      );
    }

    const index = parseInt(key.replace('[', '').replace(']', ''));

    return getNode(node[index], path);
  }

  if (typeof node === 'object') {
    const key = path.pop()!;

    return getNode(node[key] as Node, path);
  }

  throw new Error(
    `Node is primary value, but path is not empty: ${path.join(' ')}`,
  );
}

export function getObjectNode<T extends Node>(
  node: T,
  path: string[],
): ObjectNode | null {
  const n = getNode(node, path);

  if (typeof n !== 'object' || n instanceof Date || Array.isArray(n)) {
    throw new Error(`Excepted object node, received ${n}.`);
  }

  return n;
}

export function getField(
  path: string[],
  node: FormFields,
  originalPath: string,
): AnyFieldApi {
  const key = path.shift()!;

  if (!(key in node)) {
    throw new Error(
      `Unknown property ${key}' in object ${node}. Original path: ${originalPath}`,
    );
  }

  const value = node[key];

  if (!value) {
    throw new Error(
      `Unknown field with name ${key} in node ${node}. Original path: ${originalPath}`,
    );
  }

  if (typeof value === 'object' && !(value instanceof Date)) {
    if ('type' in value) {
      if (path.length === 0) {
        return value as AnyFieldApi;
      }

      switch (value.type) {
        case primaryFieldSymbol: {
          throw new Error(
            `Cannot get subproperty of primary field. Original path: ${originalPath}, steps remaining: ${path}`,
          );
        }
        case arrayFieldSymbol: {
          throw new Error(
            `Cannot get subproperty of array field. Original path: ${originalPath}, steps remaining: ${path}`,
          );
        }
        default: {
          throw new Error(`Unknown field type. Received: ${value}`);
        }
      }
    } else {
      if (path.length === 0) {
        throw new Error(
          `'No parts of path found and target is not field. Received: ${value}'`,
        );
      }

      return getField(path, value, originalPath);
    }
  }

  throw new Error(
    `Received primary value instead of field. Received: ${value}`,
  );
}
