import { ArrayFieldApi, PrimaryFieldApi, PrimaryValue, ReadyFieldsGroupSchema } from "../fields"

export interface CreateFormOptions {

}

export type FormValues = {
    [k: string]: FormValues | PrimaryValue | FormValues[];
}

export type GetInitialValuesResult = { values: FormValues; forkedSchema: ReadyFieldsGroupSchema };

export type Fields = {
    [k: string]: Fields | PrimaryFieldApi<PrimaryValue> | ArrayFieldApi;
}
