import { Event, EventCallable, Store } from "effector";
import { AnySchema, ReadyFieldsGroupSchema } from "../fields-group";

export const arrayFieldSymbol = Symbol('array-field');

export type PushPayload = AnySchema;
export type UnshiftPayload = AnySchema;
export type SwapPayload = { indexA: number; indexB: number; };
export type MovePayload = { from: number; to: number; };
export type InsertOrReplacePayload = { index: number; value: AnySchema };
export type RemovePayload = { index: number };

export interface ArrayFieldApi {
    push: EventCallable<PushPayload>;
    swap: EventCallable<SwapPayload>;
    move: EventCallable<MovePayload>;
    insert: EventCallable<InsertOrReplacePayload>;
    unshift: EventCallable<AnySchema>;
    remove: EventCallable<RemovePayload>;
    pop: EventCallable<void>;
    replace: EventCallable<InsertOrReplacePayload>;

    pushed: Event<{ params: PushPayload, result: ReadyFieldsGroupSchema[] }>;
    swapped: Event<{ params: SwapPayload, result: ReadyFieldsGroupSchema[] }>;
    moved: Event<{ params: MovePayload, result: ReadyFieldsGroupSchema[] }>;
    inserted: Event<{ params: InsertOrReplacePayload, result: ReadyFieldsGroupSchema[] }>;
    unshifted: Event<{ params: UnshiftPayload, result: ReadyFieldsGroupSchema[] }>;
    removed: Event<{ params: RemovePayload, result: ReadyFieldsGroupSchema[] }>;
    popped: Event<ReadyFieldsGroupSchema[]>;
    replaced: Event<{ params: InsertOrReplacePayload, result: ReadyFieldsGroupSchema[] }>;
}

export interface ArrayField extends ArrayFieldApi {
    type: typeof arrayFieldSymbol;

    $values: Store<ReadyFieldsGroupSchema[]>;

    

    forkOnCompose: boolean;
    fork: (newValues?: AnySchema[]) => ArrayField;
}

export interface CreateArrayFieldOptions {
    forkOnCompose?: boolean;
}
