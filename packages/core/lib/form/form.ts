import { createEffect, createEvent, sample } from "effector";
import { AnySchema, arrayFieldSymbol, forkGroup, prepareFieldsSchema, primaryFieldSymbol, } from "../fields";
import { ComposeOptions, FormValues, SetErrorPayload, SetErrorsPayload, SetValuePayload, SetValuesPayload } from "./types";
import { getField, watchSchema } from "./utils";

export function compose<T extends AnySchema>(schema: T, options?: ComposeOptions) {
    const fields = forkGroup(prepareFieldsSchema(schema));
    const { $errors, $values } = watchSchema(fields);

    type Fields = typeof fields;

    const validateFx = createEffect(() => {});

    const setValue = createEvent<SetValuePayload>();
    const setValues = createEvent<SetValuesPayload>();

    const setError = createEvent<SetErrorPayload>();
    const setErrors = createEvent<SetErrorsPayload>();

    const changed = createEvent<FormValues<Fields>>();

    const submit = createEvent<void>();
    const submitted = createEvent<FormValues<Fields>>();

    const validate = createEvent<void>();
    const validated = createEvent<void>();

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
