import { ArrayField, } from "../array-field/types";
import { PrimaryField, PrimaryValue } from "../primary-field/types";

export type RawFieldsGroupSchema = {
    [k in string]: PrimaryValue | PrimaryField<PrimaryValue> | RawFieldsGroupSchema[] | ArrayField | RawFieldsGroupSchema;
}

export type ReadyFieldsGroupSchema = { type: typeof fieldsGroupSymbol } & {
    [k in string]: PrimaryField<PrimaryValue> | ArrayField | ReadyFieldsGroupSchema;
}

export type AnySchema = RawFieldsGroupSchema | ReadyFieldsGroupSchema;
export const fieldsGroupSymbol = Symbol('fields-group');
