import { Store, StoreValue } from "effector";
import { ArrayField, } from "../array-field/types";
import { PrimaryField, PrimaryValue } from "../primary-field/types";

type ReadyFieldsSchemaFieldType = PrimaryField | ArrayField<any> | ReadyFieldsGroupSchema;
type RawFieldsSchemaFieldType = PrimaryValue | RawFieldsSchemaFieldType[] | RawFieldsGroupSchema | ReadyFieldsSchemaFieldType;

export type RawFieldsGroupSchema = {
    [k in string]: RawFieldsSchemaFieldType;
}

export type ReadyFieldsGroupSchema = { [k in string]: PrimaryField | ArrayField<any> | ReadyFieldsGroupSchema };

export type AnySchema = RawFieldsGroupSchema | ReadyFieldsGroupSchema;

export type UserFormSchema<T extends AnySchema> = {
    [K in keyof T]: T[K] extends PrimaryValue ? PrimaryField<T[K]> :
    T[K] extends Array<any> ? ArrayField<T[K][number]> :
        T[K] extends PrimaryField<any> ? T[K] :
            T[K] extends ArrayField<any> ? Omit<T[K], '$values'> &  { $values: Store<StoreValue<T[K]['$values']>> } :
                T[K] extends AnySchema ? UserFormSchema<T[K]> : never;
}
