---
id: create-field
sidebar_position: 2
title: createField
tags:
  - Core
  - Primitive field
---

Creates field, which contains primitive value (like `string`, `number`, `boolean`, `Date`, `bigint`, `Blob`, `ArrayBuffer`, `File`, `FileList`, `null`)

### Formulae

```ts
interface CreatePrimaryFieldOptions {
  error?: FieldError;
  clearOuterErrorOnChange?: boolean;
  forkOnCreateForm?: boolean;
}

function createField<T extends PrimaryValue>(
  defaultValue: T,
  overrides?: CreatePrimaryFieldOptions,
): PrimaryField<T>;
```

### Examples

```ts
import { createField } from "@effector-reform/core";
import { sample, createEffect } from "effector";

const numberField = createField(0);
const stringField = createField('');
const typedStringField = createField<'inner' | 'outer'>('inner');

const logFx = createEffect(console.log);

sample({
  clock: [numberField.changed, stringField.changed],
  target: logFx,
});

numberField.change(10); // logFx -> 10
stringField.change('test'); // logFx -> 'test'
```

### API reference

| name         | type                                                       | description                                                                   |
|--------------|------------------------------------------------------------|-------------------------------------------------------------------------------|
| $value       | `Store<T>`                                                 | value of field                                                                |
| $error       | `Store<FieldError>`                                        | error of field                                                                |
| $isDirty     | `Store<boolean>`                                           | is field changed after creating                                               |
| $isValid     | `Store<boolean>`                                           | is field valid                                                                |
| $isFocused   | `Store<boolean>`                                           | is user focused on field                                                      |
| blurred      | `Event<void>`                                              | triggered when user blurred input (you must set focus/blur handlers in input) |
| focused      | `Event<void>`                                              | triggered when user focused input (you must set focus/blur handlers in input) |
| fork         | `(options?: CreatePrimaryFieldOptions) => PrimaryField<T>` | fork field (create field independent copy)                                    |
| change       | `EventCallable<T>`                                         | change field value                                                            |
| changed      | `Event<T>`                                                 | triggered when field value changed                                            |
| reset        | `EventCallable<void>`                                      | reset field value                                                             |
| changeError  | `EventCallable<FieldError>`                                | change outer field error                                                      |
| errorChanged | `Event<FieldError>`                                        | triggered when error changed (inner or outer)                                 |