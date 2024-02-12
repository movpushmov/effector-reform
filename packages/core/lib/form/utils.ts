import { createEvent, createStore, sample } from "effector";
import { PrimaryValue, ReadyFieldsGroupSchema, arrayFieldSymbol, isArrayField, isPrimaryField, primaryFieldSymbol } from "../fields";
import { AnyFieldApi, FormErrors, FormFields, FormValues, WatchSchemaResult } from "./types";

export function watchSchema<T extends ReadyFieldsGroupSchema>(formSchema: T): WatchSchemaResult<T> {
    const $schema = createStore(formSchema);

    const $values = $schema.map(schema => {
        function getValues(node: ReadyFieldsGroupSchema): FormValues {
            return Object.entries(node).reduce<FormValues>((acc, [key, value]) => {
                if (isArrayField(value)) {
                    acc[key] = value.$values.getState().map(getValues);
                } else if (isPrimaryField(value)) {
                    acc[key] = value.$value.getState();
                } else {
                    acc[key] = getValues(value);
                }

                return acc;
            }, {});
        }

        return getValues(schema);
    });

    const $errors = $schema.map(schema => {
        function getErrors(node: ReadyFieldsGroupSchema): FormErrors {
            return Object.entries(node).reduce<FormErrors>((acc, [key, value]) => {
                if (isArrayField(value)) {
                    acc[key] = value.$values.getState().map(getErrors);
                } else if (isPrimaryField(value)) {
                    acc[key] = value.$error.getState();
                } else {
                    acc[key] = getErrors(value);
                }

                return acc;
            }, {});
        }

        return getErrors(schema);
    });

    const updateSchema = createEvent();

    sample({
        clock: updateSchema,
        source: $schema,
        fn: (s) => ({ ...s }),
        target: $schema,
    });

    return { $schema, $values, $errors, updateSchema };
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
