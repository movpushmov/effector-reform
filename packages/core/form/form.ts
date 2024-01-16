import { createEvent, createStore } from "effector";
import { AnySchema, ReadyFieldsGroupSchema, arrayFieldSymbol, createGroup, fieldsGroupSymbol, forkGroup, prepareFieldsSchema, primaryFieldSymbol } from "../fields";
import { CreateFormOptions, Fields, FormValues, GetInitialValuesResult } from "./types";

export function createForm(schema: AnySchema, options?: CreateFormOptions) {
    const preparedSchema = prepareFieldsSchema(schema);

    const $schema = createStore(initialValues.forkedSchema);
    const $values = createStore(initialValues.values);

    const change = createEvent<{ field: string; value: any } | ({ field: string; value: any })[]>();
    const changed =

    return {  };
}
