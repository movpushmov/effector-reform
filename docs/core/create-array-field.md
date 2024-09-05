# createArrayField

Creates field, which contains an array of primitive values (check [createField api docs](./create-field)) or an array of objects with subfields

__Type Signature:__

```ts
interface CreateArrayFieldOptions<Meta extends object = any> {
  error?: FieldError;
  meta?: Meta;
  copyOnCreateForm?: boolean;
}

function createArrayField<
  T extends PrimitiveValue | AnySchema,
  Meta extends object = any,
  Value = UserFormSchema<T>,
>(
  values: T[],
  overrides?: CreateArrayFieldOptions<Meta>,
): ArrayField<T, Meta, Value>
```

__Example Usage:__

```ts
import { createArrayField } from "@effector-reform/core";
import { createEvent, sample, createEffect } from "effector";

const arrayFieldPrimary = createArrayField<number>([]);
const addNumber = createEvent<number>();

const logFx = createEffect(console.log);

sample({
  clock: addNumber,
  target: arrayFieldPrimary.push,
});

sample({
  clock: arrayFieldPrimary.changed,
  target: logFx,
});

addNumber(10); // logFx -> [10]
addNumber(20); // logFx -> [10, 20]
```

*array field with primitive values*

```ts
import { createArrayField } from "@effector-reform/core";
import { createEvent, sample } from "effector";

const field = createArrayField<number, { onlyPositive: boolean }>([], {
  meta: { onlyPositive: false }
});

const ruleToggled = createEvent();

sample({
  clock: ruleToggled,
  source: field.$meta,
  fn: (meta) => { onlyPositive: !meta.onlyPositive },
  target: field.changeMeta,
});

field.$meta.getState(); // { onlyPositive: false } 

ruleToggled();

field.$meta.getState(); // { onlyPositive: true } 
```

*array field meta example*

::: warning

By the some reasons, you can't use dynamic array field subfields in
effector logic, cause the sample/split/etc target must be static.

:::

::: tip
you can use any variant of schema values
in array field api
:::

```ts
field.change([10])
field.change([{ name: 'John' }])
field.change([{ name: createField('John') }])
field.change([{ names: createArrayField<string>(['John']) }])
```

## API

| name         | type                                                           | description                                                                                                 |
| ------------ | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| changeError  | `EventCallable<FieldError>`                                  | change outer array field error                                                                              |
| change       | `EventCallable<T[]>`                                         | change array field values, like:`field.change([10, 20])`                                             |
| push         | `EventCallable<PushPayload<T>>`                              | push item at the and of array, like:`field.push(10)`                                                 |
| changeMeta   | `EventCallable<Meta>`                                        | change field meta, like:`field.changeMeta({ onlyPositive: true })`                                   |
| swap         | `EventCallable<SwapPayload>`                                 | swap items by indexes, like:`field.swap({ indexA: 2, indexB: 10 })`                                  |
| move         | `EventCallable<MovePayload>`                                 | move item by indexes, like:`field.move({ from: 2, to: 10 })`                                         |
| insert       | `EventCallable<InsertOrReplacePayload<T>>`                   | insert item at the index, like:`field.insert({ index: 2, value: 10 })`                               |
| unshift      | `EventCallable<UnshiftPayload<T>>`                           | unshift value (place at the start), like:`field.unshift(2)```or`field.unshift([2, 4])` |
| remove       | `EventCallable<RemovePayload>`                               | remove item by index, like:`field.remove({ index: 10 })`                                             |
| pop          | `EventCallable<void>`                                        | pop item (remove last element), like:`field.pop()`                                                   |
| replace      | `EventCallable<InsertOrReplacePayload<T>>`                   | replace item by index, like:`field.replace({ index: 2, value: 10 })`                                 |
| reset        | `EventCallable<{ values: U; error: FieldError }>`            | reset field values                                                                                          |
| changed      | `Event<U[]>`                                                 | triggered when values changed                                                                               |
| errorChanged | `Event<FieldError>`                                          | triggered when outer or inner error changed                                                                 |
| pushed       | `Event<{ params: PushPayload<T>; result: U[] }>`             | triggered when pushed                                                                                       |
| metaChanged  | `Event<Meta>`                                                | field meta changed                                                                                          |
| swapped      | `Event<{ params: SwapPayload; result: U[] }>`                | triggered when swapped                                                                                      |
| moved        | `Event<{ params: MovePayload; result: U[] }>`                | triggered when moved                                                                                        |
| inserted     | `Event<{ params: InsertOrReplacePayload<T>; result: U[]; }>` | triggered when inserted                                                                                     |
| unshifted    | `Event<{ params: UnshiftPayload<T>; result: U[]; }>`         | triggered when unshifted                                                                                    |
| removed      | `Event<{ params: RemovePayload; result: U[] }>`              | triggered when removed                                                                                      |
| popped       | `Event<U[]>`                                                 | triggered when popped                                                                                       |
| replaced     | `Event<{ params: InsertOrReplacePayload<T>; result: U[]; }>` | triggered when replaced                                                                                     |
| $values      | `Store<U[]>`                                                 | primitive values (or objects with subfields)                                                                |
| $error       | `Store<FieldError>`                                          | error of array field                                                                                        |
| $meta        | `Store<Meta>`                                                | field meta                                                                                                  |
| $isDirty     | `Store<boolean>`                                             | is field changed                                                                                            |
| $isValid     | `Store<boolean>`                                             | is field valid                                                                                              |
