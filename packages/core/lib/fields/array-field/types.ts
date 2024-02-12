import { Event, EventCallable, Store } from "effector";
import { AnySchema, ReadyFieldsGroupSchema } from "../fields-group";

export const arrayFieldSymbol = Symbol('array-field');

export type PushPayload<T extends AnySchema> = T | T[];
export type UnshiftPayload<T extends AnySchema> = T | T[];
export type SwapPayload = { indexA: number; indexB: number; };
export type MovePayload = { from: number; to: number; };
export type InsertOrReplacePayload<T extends AnySchema> = { index: number; value: T | T[] };
export type RemovePayload = { index: number };

export interface ArrayFieldApi<T extends AnySchema> {
    push: EventCallable<PushPayload<T>>;
    swap: EventCallable<SwapPayload>;
    move: EventCallable<MovePayload>;
    insert: EventCallable<InsertOrReplacePayload<T>>;
    unshift: EventCallable<UnshiftPayload<T>>;
    remove: EventCallable<RemovePayload>;
    pop: EventCallable<void>;
    replace: EventCallable<InsertOrReplacePayload<T>>;

    pushed: Event<{ params: PushPayload<T>, result: ReadyFieldsGroupSchema[] }>;
    swapped: Event<{ params: SwapPayload, result: ReadyFieldsGroupSchema[] }>;
    moved: Event<{ params: MovePayload, result: ReadyFieldsGroupSchema[] }>;
    inserted: Event<{ params: InsertOrReplacePayload<T>, result: ReadyFieldsGroupSchema[] }>;
    unshifted: Event<{ params: UnshiftPayload<T>, result: ReadyFieldsGroupSchema[] }>;
    removed: Event<{ params: RemovePayload, result: ReadyFieldsGroupSchema[] }>;
    popped: Event<ReadyFieldsGroupSchema[]>;
    replaced: Event<{ params: InsertOrReplacePayload<T>, result: ReadyFieldsGroupSchema[] }>;
}

export interface ArrayField<T extends AnySchema> extends ArrayFieldApi<T> {
    type: ArrayFieldType;

    $values: Store<any[]>;

    forkOnCompose: boolean;
    fork: (options?: CreateArrayFieldOptions) => ArrayField<T>;
}

export interface CreateArrayFieldOptions {
    forkOnCompose?: boolean;
}

export type ArrayFieldType = typeof arrayFieldSymbol;
