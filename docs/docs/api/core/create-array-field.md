---
id: create-array-field
sidebar_position: 3
title: createArrayField
tags:
  - Core
  - Array field
---

Creates field, which contains an array of primitive values (check [createField api docs](./create-field)) or an array of objects with subfields

### Formulae

```ts
interface CreateArrayFieldOptions {
  forkOnCreateForm?: boolean;
  clearOuterErrorOnChange?: boolean;
}

function createArrayField<
  T extends PrimaryValue | AnySchema,
  Value = UserFormSchema<T>,
>(values: T[], overrides?: CreateArrayFieldOptions): ArrayField<T, Value>;
```

### Examples

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

### Limitations

By the some reasons, you can't use dynamic array field subfields in
effector logic, cause the sample/split/etc target must be static. But
you can use prime values from `form` or in `validation` or in `react` with `@effector-reform/react`

### API reference

*T — raw item type, U — ready schema type*<br/>
****Note***: you can use any variant of schema values in array field api*

```ts
field.change([10])
field.change([{ name: 'John' }])
field.change([{ name: createField('John') }])
field.change([{ names: createArrayField<string>(['John']) }])
```

| name         | type                                                         | description                                                                                         |
|--------------|--------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| changeError  | `EventCallable<FieldError>`                                  | change outer array field error                                                                      |
| change       | `EventCallable<T[]>`                                         | change array field values, like:<br/>`field.change([10, 20])`                                       |
| push         | `EventCallable<PushPayload<T>>`                              | push item at the and of array, like:<br/>`field.push(10)`                                           |
| swap         | `EventCallable<SwapPayload>`                                 | swap items by indexes, like:<br/>`field.swap({ indexA: 2, indexB: 10 })`                            |
| move         | `EventCallable<MovePayload>`                                 | move item by indexes, like:<br/>`field.move({ from: 2, to: 10 })`                                   |
| insert       | `EventCallable<InsertOrReplacePayload<T>>`                   | insert item at the index, like:<br/>`field.insert({ index: 2, value: 10 })`                         |
| unshift      | `EventCallable<UnshiftPayload<T>>`                           | unshift value (place at the start), like:<br/>`field.unshift(2)`<br/>or<br/>`field.unshift([2, 4])` |
| remove       | `EventCallable<RemovePayload>`                               | remove item by index, like:<br/>`field.remove({ index: 10 })`                                       |
| pop          | `EventCallable<void>`                                        | pop item (remove last element), like:<br/>`field.pop()`                                             |
| replace      | `EventCallable<InsertOrReplacePayload<T>>`                   | replace item by index, like:<br/>`field.replace({ index: 2, value: 10 })`                           |
| reset        | `EventCallable<{ values: U; error: FieldError }>`            | reset field values                                                                                  |
| changed      | `Event<U[]>`                                                 | triggered when values changed                                                                       |
| errorChanged | `Event<FieldError>`                                          | triggered when outer or inner error changed                                                         |
| pushed       | `Event<{ params: PushPayload<T>; result: U[] }>`             | triggered when pushed                                                                               |
| swapped      | `Event<{ params: SwapPayload; result: U[] }>`                | triggered when swapped                                                                              |
| moved        | `Event<{ params: MovePayload; result: U[] }>`                | triggered when moved                                                                                |
| inserted     | `Event<{ params: InsertOrReplacePayload<T>; result: U[]; }>` | triggered when inserted                                                                             |
| unshifted    | `Event<{ params: UnshiftPayload<T>; result: U[]; }>`         | triggered when unshifted                                                                            |
| removed      | `Event<{ params: RemovePayload; result: U[] }>`              | triggered when removed                                                                              |
| popped       | `Event<U[]>`                                                 | triggered when popped                                                                               |
| replaced     | `Event<{ params: InsertOrReplacePayload<T>; result: U[]; }>` | triggered when replaced                                                                             |
| $values      | `Store<U[]>`                                                 | primitive values (or objects with subfields)                                                        |
| $error       | `Store<FieldError>`                                          | error of array field                                                                                |
| $isDirty     | `Store<boolean>`                                             | is field changed                                                                                    |
| $isValid     | `Store<boolean>`                                             | is field valid                                                                                      |
| fork         | `(options?: CreateArrayFieldOptions) => ArrayField<T>`       | fork field (create field independent copy)                                                          |