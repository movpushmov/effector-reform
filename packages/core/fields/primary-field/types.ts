import { EventCallable, Store, Event } from "effector";
import { FieldError } from "../types";

export type PrimaryValue = string | number | boolean | Date;

export interface PrimaryFieldForkConfig<T extends PrimaryValue> extends CreatePrimaryFieldOptions {
    value?: T;
    error?: FieldError;
}

export interface PrimaryFieldApi<T extends PrimaryValue> {
    change: EventCallable<T>;
    changed: Event<T>;

    setError: EventCallable<FieldError>;
    errorChanged: Event<FieldError>;
}

export interface PrimaryField<T extends PrimaryValue> extends PrimaryFieldApi<T> {
    type: typeof primaryFieldSymbol;

    $value: Store<T>;
    $error: Store<FieldError>;
    
    forkOnCompose: boolean;

    fork: () => PrimaryField<T>;
}

export interface CreatePrimaryFieldOptions {
    error?: FieldError;
    forkOnCompose?: boolean;
}

export const primaryFieldSymbol = Symbol('primary-field');
