import { attach, createEvent, createStore, sample } from "effector";
import { ArrayField, InsertOrReplacePayload, MovePayload, PushPayload, RemovePayload, SwapPayload, UnshiftPayload, arrayFieldSymbol, CreateArrayFieldOptions } from "./types";
import { AnySchema, ReadyFieldsGroupSchema, forkGroup, prepareFieldsSchema } from "../fields-group";
import { spread } from "patronum";

const defaultOptions = {
    forkOnCompose: true,
};

export function createArrayField(values: AnySchema[], overrides?: CreateArrayFieldOptions): ArrayField {
    const options = { ...defaultOptions, ...overrides };

    const $values = createStore(values.map(prepareFieldsSchema));

    const push = createEvent<PushPayload>();
    const pushed = createEvent<{ params: PushPayload, result: ReadyFieldsGroupSchema[] }>();

    const swap = createEvent<SwapPayload>();
    const swapped = createEvent<{ params: SwapPayload, result: ReadyFieldsGroupSchema[] }>();

    const move = createEvent<MovePayload>();
    const moved = createEvent<{ params: MovePayload, result: ReadyFieldsGroupSchema[] }>();

    const insert = createEvent<InsertOrReplacePayload>();
    const inserted = createEvent<{ params: InsertOrReplacePayload, result: ReadyFieldsGroupSchema[] }>();

    const unshift = createEvent<UnshiftPayload>();
    const unshifted = createEvent<{ params: UnshiftPayload, result: ReadyFieldsGroupSchema[] }>();

    const remove = createEvent<RemovePayload>();
    const removed = createEvent<{ params: RemovePayload, result: ReadyFieldsGroupSchema[] }>();

    const pop = createEvent<void>();
    const popped = createEvent<ReadyFieldsGroupSchema[]>();

    const replace = createEvent<InsertOrReplacePayload>();
    const replaced = createEvent<{ params: InsertOrReplacePayload, result: ReadyFieldsGroupSchema[] }>();

    const reset = createEvent();

    sample({ clock: reset, fn: () => values.map(prepareFieldsSchema), target: $values });

    const pushFx = attach({
        source: $values,
        effect: (values, payload: PushPayload) => values.concat(prepareFieldsSchema(payload)),
    });

    const swapFx = attach({
        source: $values,
        effect: (values, payload: SwapPayload) => {
            const newValues = [...values];

            const element = newValues[payload.indexA];

            newValues[payload.indexA] = newValues[payload.indexB];
            newValues[payload.indexB] = element;

            return newValues;
        },
    });

    const moveFx = attach({
        source: $values,
        effect: (values, payload: MovePayload) => {
            const newValues = [...values];
            newValues.splice(payload.to, 0, ...newValues.splice(payload.from, 1));

            return newValues;
        },
    });
    
    const insertFx = attach({
        source: $values,
        effect: (values, payload: InsertOrReplacePayload) => {
            const newValues = [...values];
            newValues.splice(payload.index, 0, prepareFieldsSchema(payload.value));

            return newValues;
        }
    });

    const unshiftFx = attach({
        source: $values,
        effect: (values, payload: UnshiftPayload) => {
            const newValues = [...values];
            newValues.unshift(prepareFieldsSchema(payload));

            return newValues;
        }
    });

    const removeFx = attach({
        source: $values,
        effect: (values, payload: RemovePayload) => {
            const newValues = [...values];
            newValues.splice(payload.index, 1);

            return newValues;
        }
    });

    const popFx = attach({
        source: $values,
        effect: (values) => {
            const newValues = [...values];
            newValues.pop();

            return newValues;
        },
    });

    const replaceFx = attach({
        source: $values,
        effect: (values, payload: InsertOrReplacePayload) => {
            const newValues = [...values];
            newValues.splice(payload.index, 1, prepareFieldsSchema(payload.value));

            return newValues;
        }
    })

    sample({ clock: push, target: pushFx });

    sample({
        clock: pushFx.done,
        fn: ({ params, result }) => ({ pushed: { params, result }, values: result }),
        target: spread({
            pushed,
            values: $values,
        }),
    });

    sample({ clock: swap, target: swapFx });

    sample({
        clock: swapFx.done,
        fn: ({ params, result }) => ({ swapped: { params, result }, values: result }),
        target: spread({
            swapped,
            values: $values,
        }),
    });

    sample({ clock: move, target: moveFx });

    sample({
        clock: moveFx.done,
        fn: ({ params, result }) => ({ moved: { params, result }, values: result }),
        target: spread({
            moved,
            values: $values,
        }),
    });

    sample({ clock: insert, target: insertFx });

    sample({
        clock: insertFx.done,
        fn: ({ params, result }) => ({ inserted: { params, result }, values: result }),
        target: spread({
            inserted,
            values: $values,
        }),
    });

    sample({ clock: unshift, target: unshiftFx });

    sample({
        clock: unshiftFx.done,
        fn: ({ params, result }) => ({ unshifted: { params, result }, values: result }),
        target: spread({
            unshifted,
            values: $values,
        }),
    });

    sample({
        clock: remove, 
        target: removeFx,
    });

    sample({
        clock: removeFx.done,
        fn: ({ params, result }) => ({ removed: { params, result }, values: result }),
        target: spread({
            removed,
            values: $values,
        }),
    });

    sample({
        clock: pop,
        target: popFx,
    });

    sample({
        clock: popFx.doneData,
        target: [popped, $values],
    });

    sample({
        clock: replace,
        target: replaceFx,
    });

    sample({
        clock: replaceFx.done,
        fn: ({ params, result }) => ({ replaced: { params, result }, values: result }),
        target: spread({
            replaced,
            values: $values,
        }),
    });

    return {
        type: arrayFieldSymbol,

        $values,

        push,
        pushed,

        swap,
        swapped,

        move,
        moved,

        insert,
        inserted,

        unshift,
        unshifted,

        remove,
        removed,

        pop,
        popped,

        replace,
        replaced,

        forkOnCompose: options.forkOnCompose,
        fork: () => createArrayField($values.getState().map(forkGroup)),
    };
}

export function isArrayField(props: any): props is ArrayField {
    return 'type' in props && props.type === arrayFieldSymbol;
}
