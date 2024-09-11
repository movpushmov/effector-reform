# createForm

Creates form

**Type Signature:**

```ts
import { Contract } from '@withease/contracts';

interface CreateFormOptions<T extends AnySchema> {
  schema: T;
  validation?:
    | SyncValidationFn<T>
    | AsyncValidationFn<T>
    | Contract<unknown, FormValues<UserFormSchema<T>>>;
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

**Example Usage:**

```ts
import {
  createArrayField,
  createField,
  createForm,
} from '@effector-reform/core';
import { sample, createEffect } from 'effector';

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

## API

| name                  | type                                                                                    | description                                                                                                                               |
| --------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| fields                | `Fields`                                                                              | contains fields of form (you can access only primitive fields api, groups or array field top api                                          |
| $values               | `Store<Values>`                                                                       | contains values of fields                                                                                                                 |
| $errors               | `Store<Errors>`                                                                       | contains errors of fields (**_Note:_** array field errors stored in format `{ error: null, errors: [] }`                        |
| $snapshot             | `Store<Values>`                                                                       | contains last saved snapshot of values (update on every `submitted and validated` event or by `forceUpdateSnapshot`)                  |
| $isChanged            | `Store<boolean>`                                                                      | `true` if snapshot not equals to values, `false` if equal                                                                             |
| $isValid              | `Store<boolean>`                                                                      | is all fields in form valid                                                                                                               |
| $isValidationPending  | `Store<boolean>`                                                                      | is validation pending at the moment                                                                                                       |
| fill                  | `EventCallable<{ values?: PartialRecursive<Values>; errors?: ErrorsSchemaPayload; }>` | set values/errors of form without trigger isDirty (by default triggerIsDirty = false, but you can pass true if you want trigger isDirty) |
| changed               | `EventCallable<Values>`                                                               | triggered when any field in form value changed                                                                                            |
| errorsChanged         | `Event<Errors>`                                                                       | triggered when any field in form error changed                                                                                            |
| validate              | `EventCallable<void>`                                                                 | validate form (calls validationFn from overrides)                                                                                         |
| validated             | `Event<Values>`                                                                       | triggered when form validated                                                                                                             |
| validationFailed      | `Event<Values>`                                                                       | triggered when form validation failed                                                                                                     |
| validatedAndSubmitted | `Event<Values>`                                                                       | triggered when form submitted and validated                                                                                               |
| submit                | `EventCallable<void>`                                                                 | submit form                                                                                                                               |
| submitted             | `Event<Values>`                                                                       | triggered when form submitted (be careful: form "submitted" called even if validate of form is failed                                     |
| reset                 | `EventCallable<void>`                                                                 | reset form values                                                                                                                         |
| clear                 | `EventCallable<void>`                                                                 | clear form values                                                                                                                         |
| clearOuterErrors      | `EventCallable<void>`                                                                 | clear form outer errors                                                                                                                   |
| clearInnerErrors      | `EventCallbable<void>`                                                                | clear form inner errors                                                                                                                   |
| forceUpdateSnapshot   | EventCallbable `<void>`                                                               | force update of snapshot                                                                                                                  |
