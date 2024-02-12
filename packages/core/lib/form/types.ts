import { EventCallable, Store, StoreValue } from "effector";
import { ArrayField, ArrayFieldApi, ArrayFieldType, FieldError, PrimaryField, PrimaryFieldApi, PrimaryFieldType, PrimaryValue, ReadyFieldsGroupSchema, arrayFieldSymbol } from "../fields"

export interface ComposeOptions {}

export type SetValuePayload = { field: string; value: any };
export type SetValuesPayload = SetValuePayload[];

export type SetErrorPayload = { field: string; value: string | null };
export type SetErrorsPayload = SetErrorPayload[];

export type FormValues<T extends ReadyFieldsGroupSchema> = {
    [k: string]: T extends PrimaryField<any> ? StoreValue<T['$value']> :
        T extends ArrayField<any> ? FormValues<StoreValue<T['$values']>> : FormValues<T>;
}

export interface WatchSchemaResult<T extends ReadyFieldsGroupSchema> {
    $schema: Store<T>;
    $values: Store<FormValues<T>>;
    $errors: Store<FormErrors>;

    updateSchema: EventCallable<void>;
}

export type AnyFieldApi =
    (PrimaryFieldApi<PrimaryValue> & { type: PrimaryFieldType; $value: Store<PrimaryValue>; $error: Store<FieldError> }) |
    (ArrayFieldApi<any> & { type: ArrayFieldType; $values: Store<FormFields[]> });

export type FormFields = {
    [k: string]: FormFields | AnyFieldApi;
}

export type FormErrors = {
    [k: string]: string | null | FormErrors[] | FormErrors;
}
