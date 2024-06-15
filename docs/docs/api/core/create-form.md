---
id: create-form
sidebar_position: 4
title: createForm
tags:
  - Core
  - Form
---

Creates form

### Formulae

```ts
interface CreateFormOptions<T extends AnySchema> {
  schema: T;
  validation?: SyncValidationFn<T> | AsyncValidationFn<T>;
  validationStrategies?: ValidationStrategy[];
  clearOuterErrorsOnSubmit?: boolean;
}

type SyncValidationFn<Schema extends AnySchema> = (
  values: FormValues<UserFormSchema<Schema>>,
) => ErrorsSchemaPayload | null;

type AsyncValidationFn<Schema extends AnySchema> = (
  values: FormValues<UserFormSchema<Schema>>,
) => Promise<ErrorsSchemaPayload | null>;

type ErrorsSchemaPayload = Record<string, FieldError>;
type ValidationStrategy = 'blur' | 'focus' | 'change' | 'submit';

function createForm<T extends AnySchema>(options: CreateFormOptions<T>);
```

### Examples

```ts
import { createArrayField, createField, createForm } from "@effector-reform/core";
import { sample, createEffect } from "effector";

const form = createForm({
  schema: {
    string: createField('John'),
    number: 0,
    nullable: null,
    array: createArrayField<Date>([new Date()]),
    group: {
      subField: createField(''),
    },
  },
});

const logFx = createEffect(console.log);

sample({
  clock: form.validatedAndSubmitted,
  target: logFx,
});

form.fields.nullable.change('hi');
form.fields.number.change(10);
form.fields.array.push(new Date());
form.fields.group.subField.change('Peter');

form.submit(); 

/*
  logFx (form.$values) -> {
    string: 'John',
    number: 10,
    nullable: 'hi',
    array: [Date, Date],
    group: { subField: 'Peter' }
  }
*/
```

### API Reference

| name                  | type                                      | description                                                                                             |
|-----------------------|-------------------------------------------|---------------------------------------------------------------------------------------------------------|
| fields                | `Fields`                                  | contains fields of form (you can access only primitive fields api, groups or array field top api        |
| $values               | `Store<Values>`                           | contains values of fields                                                                               |
| $errors               | `Store<Errors>`                           | contains error of fields (***Note:*** array field errors stored in format `{ error: null, errors: [] }` |
| $isValid              | `Store<boolean>`                          | is all fields in form valid                                                                             |
| $isDirty              | `Store<boolean>`                          | is any field of form changed                                                                            |
| $isValidationPending  | `Store<boolean>`                          | is validation pending at the moment                                                                     |
| setValues             | `EventCallable<Values>`                   | set all values of form (for all fields)                                                                 |
| setPartialValues      | `EventCallable<PartialRecursive<Values>>` | set partially values of form (for some fields)                                                          |
| setErrors             | `EventCallable<ErrorsSchemaPayload>`      | set outer errors of fields                                                                              |
| changed               | `EventCallable<Values>`                   | triggered when any field in form value changed                                                          |
| errorsChanged         | `Event<Errors>`                           | triggered when any field in form error changed                                                          |
| validate              | `EventCallable<void>`                     | validate form (calls validationFn from overrides)                                                       |
| validated             | `Event<Values>`                           | triggered when form validated                                                                           |
| validatedAndSubmitted | `Event<Values>`                           | triggered when form submitted and validated                                                             |
| submit                | `EventCallable<void>`                     | submit form                                                                                             |
| submitted             | `Event<Values>`                           | triggered when form submitted (be careful: form submitted be called even if validate of form is failed  |
| reset                 | `EventCallable<void>`                     | reset form values                                                                                       |
| clear                 | `EventCallable<void>`                     | clear form values                                                                                       |