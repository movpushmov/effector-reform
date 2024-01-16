import { arrayFieldSymbol, createArrayField, isArrayField } from "../array-field";
import { createField, isPrimaryField, primaryFieldSymbol } from "../primary-field";
import { RawFieldsGroupSchema, ReadyFieldsGroupSchema, fieldsGroupSymbol } from "./types";

export function createGroup() {
    return { type: fieldsGroupSymbol } as ReadyFieldsGroupSchema;
}

export function prepareFieldsSchema(schema: RawFieldsGroupSchema | ReadyFieldsGroupSchema): ReadyFieldsGroupSchema {
    const result = createGroup();

    for (const key in schema) {
        const element = schema[key];

        if (isPrimaryField(element) || isArrayField(element)) {
            result[key] = element;
            continue;
        }

        if (Array.isArray(element)) {
            result[key] = createArrayField(element);
            continue;
        }

        if (typeof element === 'object' && !(element instanceof Date)) {
            result[key] = prepareFieldsSchema(element);
            continue;
        }

        result[key] = createField(element);
    }

    return result;
}

export function forkGroup(group: ReadyFieldsGroupSchema): ReadyFieldsGroupSchema {
    const result = createGroup();

    for (const key in group) {
        const element = group[key];

        switch (element.type) {
            case fieldsGroupSymbol: {
                result[key] = forkGroup(element);

                break;
            }
            case arrayFieldSymbol:
            case primaryFieldSymbol: {
                result[key] = element.forkOnCompose ? element.fork() : element;

                break;
            }
        }
    }

    return result;
}
