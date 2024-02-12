import { createEvent, createStore, sample } from "effector";
import { CreatePrimaryFieldOptions, PrimaryField, PrimaryValue, primaryFieldSymbol } from "./types";
import { FieldError } from "../types";

const defaultOptions = {
    error: null,
    forkOnCompose: true,
};

export function createField<T extends PrimaryValue>(defaultValue: T, overrides?: CreatePrimaryFieldOptions): PrimaryField<T> {
    const options = { ...defaultOptions, ...overrides };

    const $value = createStore(defaultValue, { name: '<field value>' });
    const $error = createStore<FieldError>(null, { name: '<field error>' });

    const change = createEvent<T>('<field change>');
    const changed = createEvent<T>('<field changed>');

    const setError = createEvent<FieldError>('<field setError>');
    const errorChanged = createEvent<FieldError>('<field error changed>');

    const reset = createEvent('<field reset>');
    
    sample({ clock: change, target: $value });
    sample({ clock: $value, target: changed });
    sample({ clock: setError, target: $error });
    sample({ clock: $error, target: errorChanged });
    sample({ clock: reset, fn: () => defaultValue, target: $value });

    return {
        type: primaryFieldSymbol,

        $value,
        $error,

        change,
        changed,

        setError,
        errorChanged,

        forkOnCompose: options.forkOnCompose,

        fork: (options?: CreatePrimaryFieldOptions) => createField(defaultValue, { ...overrides, ...options })
    };
}

export function isPrimaryField(props: any): props is PrimaryField {
    return 'type' in props && props.type === primaryFieldSymbol;
}
