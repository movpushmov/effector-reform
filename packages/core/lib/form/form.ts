import { createEffect, createEvent, sample } from "effector";
import { AnySchema, arrayFieldSymbol, forkGroup, prepareFieldsSchema, primaryFieldSymbol, } from "../fields";
import { ComposeOptions, FormValues, SetErrorPayload, SetErrorsPayload, SetValuePayload, SetValuesPayload } from "./types";
import { getField, watchSchema } from "./utils";

export function compose<T extends AnySchema>(schema: T, options?: ComposeOptions) {
    const fields = forkGroup(prepareFieldsSchema(schema));
    const { $errors, $values, updateSchema } = watchSchema(fields);

    function changeFieldValue(payload: SetValuePayload) {
        const field = getField(payload.field.split('.'), fields, payload.field);
    
        switch (field.type) {
            case primaryFieldSymbol: {
                field.change(payload.value);
                break;
            }
            case arrayFieldSymbol: {
                throw new Error(`Cannot change array field value, use array field API instead. Field path: ${payload.field}, value: ${payload.value}`);
            }
        }
    }

    function changeFieldError(payload: SetErrorPayload) {
        const field = getField(payload.field.split('.'), fields, payload.field);
    
        switch (field.type) {
            case primaryFieldSymbol: {
                field.setError(payload.value);
                break;
            }
            case arrayFieldSymbol: {
                throw new Error(`Cannot change array field error. Field path: ${payload.field}, value: ${payload.value}`);
            }
        }
    }

    const setValueFx = createEffect(changeFieldValue);

    const setValuesFx = createEffect((fieldsPayload: SetValuesPayload) => {
        for (const payload of fieldsPayload) {
            changeFieldValue(payload);
        }
    });

    const setErrorFx = createEffect(changeFieldError);
    
    const setErrorsFx = createEffect((fieldsPayload: SetErrorsPayload) => {
        for (const payload of fieldsPayload) {
            changeFieldError(payload);
        }
    });

    const validateFx = createEffect(() => {});

    const setValue = createEvent<SetValuePayload>();
    const setValues = createEvent<SetValuesPayload>();

    const setError = createEvent<SetErrorPayload>();
    const setErrors = createEvent<SetErrorsPayload>();

    const changed = createEvent<FormValues>();

    const submit = createEvent<void>();
    const submitted = createEvent<FormValues>();

    const validate = createEvent<void>();
    const validated = createEvent<void>();

    sample({
        clock: setValue,
        target: setValueFx
    });

    sample({
        clock: setValues,
        target: setValuesFx,
    });

    sample({
        clock: setError,
        target: setErrorFx
    });

    sample({
        clock: setErrors,
        target: setErrorsFx,
    });

    sample({
        clock: [setValueFx.done, setValuesFx.done, setErrorFx.done, setErrorsFx.done],
        fn: () => undefined,
        target: updateSchema,
    });

    sample({
        clock: $values,
        target: changed,
    });

    sample({
        clock: submit,
        target: validate,
    });

    sample({
        clock: validated,
        source: $values,
        target: submitted,
    });

    return {
        $errors,
        $values,

        fields,

        setValue,
        setValues,
        changed,
        setError,
        setErrors,
        submit,
        submitted,
        validate,
        validated,

        '@@unitShape': () => ({
            fields,
            errors: $errors,
            values: $values,

            onChange: setValue,
            setError: setError,
            onSubmit: submit,
            onValidate: validate,
        }),
    };
}
