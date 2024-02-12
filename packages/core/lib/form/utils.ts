import { createEffect, createEvent, createStore, sample } from "effector";
import { ArrayFieldItem, PrimaryValue, ReadyFieldsGroupSchema, UserFormSchema, arrayFieldSymbol, isArrayField, isPrimaryField, primaryFieldSymbol } from "../fields";
import { AnyFieldApi, FormErrors, FormFields, FormValues, WatchSchemaResult, OnNodeHandlers } from "./types";

export function watchSchema<T extends ReadyFieldsGroupSchema>(formSchema: T): WatchSchemaResult<T> {
    let values = {} as FormValues<T>;
    let errors = {} as FormErrors;

    const changeValues = createEvent<FormValues<T>>('change values');
    const changeErrors = createEvent<FormErrors>();

    values = walkNodes(formSchema, [], {
        onArrayField: (node, path) => {
            const changeValuesFx = createEffect((value: ArrayFieldItem[]) => {
                const valuesCopy = { ...values };

                const rootPath = [...path];
                const nodeKey = rootPath.pop()!;

                const valuesNode = getNode(valuesCopy, rootPath);

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
                const valuesCopy = { ...values };

                const rootPath = [...path];
                const nodeKey = rootPath.pop()!;

                const valueNode = getNode(valuesCopy, rootPath);

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
        }
    });

    errors = walkNodes(formSchema, [], {
        onPrimaryField: (node, path) => {
            const changeValueFx = createEffect((value: string | null) => {
                const valuesCopy = { ...values };

                const rootPath = [...path];
                const nodeKey = rootPath.pop()!;

                const valueNode = getNode(valuesCopy, rootPath);

                if (!valueNode) {
                    throw new Error();
                }

                valueNode[nodeKey] = value;

                return valuesCopy;
            });

            sample({
                clock: node.$error,
                target: changeValueFx,
            });

            sample({
                clock: changeValueFx.doneData,
                target: changeValues,
            });
        }
    });
    
    const $values = createStore(values);
    const $errors = createStore(errors);

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

function walkNodes<T extends ReadyFieldsGroupSchema>(formSchema: T, path: string[] = [], handlers?: OnNodeHandlers): FormValues<T> {
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
                result[key] = walkNodes(node, [...path, key]);

                break;
            }
        }
    }

    return result;
}

export function getValue(path: string, node: FormFields): PrimaryValue | FormFields[] {
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

type Node = FormValues<any> | FormErrors | PrimaryValue | ArrayFieldItem[] | string | null | FormErrors[];

export function getNode<T extends Node>(node: T, path: string[]): Node {
    if (path.length === 0) {
        return node;
    }

    if (!node) {
        throw new Error(`Node is null or undefined, but path is not empty: ${path.join(' ')}`);
    }

    if (node instanceof Date) {
        throw new Error(`Node is Date, but path is not empty: ${path.join(' ')}`);
    }

    if (Array.isArray(node)) {
        const key = path.pop()!;

        if (!/\[\d+\]/.test(key)) {
            throw new Error(`Node is array, but next path key is not array indexer in [number] format. ${key}`)
        }

        const index = parseInt(key.replace('[', '').replace(']', ''))

        return getNode(node[index], path);
    }

    if (typeof node === 'object') {
        const key = path.pop()!;

        return getNode(node[key] as Node, path);
    }

    throw new Error(`Node is primary value, but path is not empty: ${path.join(' ')}`);
}

export function getField(path: string[], node: FormFields, originalPath: string): AnyFieldApi {
    const key = path.shift()!;

    if (!(key in node)) {
        throw new Error(`Unknown property ${key}' in object ${node}. Original path: ${originalPath}`);
    }

    const value = node[key];

    if (!value) {
        throw new Error(`Unknown field with name ${key} in node ${node}. Original path: ${originalPath}`);
    }

    if (typeof value === 'object' && !(value instanceof Date)) {
        if ('type' in value) {
            if (path.length === 0) {
                return value as AnyFieldApi;
            }

            switch (value.type) {
                case primaryFieldSymbol: {
                    throw new Error(`Cannot get subproperty of primary field. Original path: ${originalPath}, steps remaining: ${path}`);
                }
                case arrayFieldSymbol: {
                    const index = path.shift();

                    if (!index || !(/^\[\d+\]$/).test(index)) {
                        throw new Error(`Path part after array key must be in format [index]. Received: ${index}`);
                    }

                    const parsedIndex = parseInt(index.slice(1, index.length - 1));
                    const element = value[parsedIndex];

                    if (!element) {
                        throw new Error(`Element with index ${parsedIndex} doesn't exists in array field ${JSON.stringify(value)}`)
                    }

                    return getField(path, element, originalPath);
                }
                default: {
                    throw new Error(`Unknown field type. Received: ${value}`)
                }
            }
        } else {
            if (path.length === 0) {
                throw new Error(`'No parts of path found and target is not field. Received: ${value}'`);
            }

            return getField(path, value, originalPath);
        }
    }

    throw new Error(`Received primary value instead of field. Received: ${value}`);
}
