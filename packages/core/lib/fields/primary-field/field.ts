import { createEvent, createStore, sample } from "effector";
import { CreatePrimaryFieldOptions, PrimaryField, PrimaryValue, primaryFieldSymbol } from "./types";
import { FieldError } from "../types";

const defaultOptions = {
    error: null,
    forkOnCompose: true,
};

export function createField<T extends PrimaryValue>(defaultValue: T, overrides?: CreatePrimaryFieldOptions): PrimaryField<T> {
    const options = { ...defaultOptions, ...overrides };

    const $value = createStore(defaultValue);
    const $error = createStore<FieldError>(null);

    const change = createEvent<T>();
    const changed = createEvent<T>();

    const setError = createEvent<FieldError>();
    const errorChanged = createEvent<FieldError>();

    const reset = createEvent();
    
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
