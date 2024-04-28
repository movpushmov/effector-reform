---
id: use-form
sidebar_position: 3
title: useForm
tags:
  - React
  - Form
---

Use form model in react component

### Formulae

```ts
interface UseFormProps {
  resetOnUnmount?: boolean;
}

type AnyForm = FormType<any, any, any>;

function useForm<
  T extends AnyForm,
  Schema extends ReadyFieldsGroupSchema = T extends FormType<infer K, any, any>
    ? K
    : never,
  Values extends FormValues<any> = T extends FormType<any, infer K, any>
    ? K
    : never,
  Errors extends FormErrors<any> = T extends FormType<any, any, infer K>
    ? K
    : never,
>(form: T, props?: UseFormProps): ReactForm<Schema, Values, Errors>;
```

### Examples

```tsx
import { useForm } from '@effector-reform/react';
import { createForm } from "@effector-reform/core";

const form = createForm({
  schema: {
    name: '',
    age: 18,
  },
})

function Form() {
  const { fields, submit } = useForm(form);

  return (
    <form onSubmit={submit}>
      <input
        value={fields.name.value}
        onChange={(event) => fields.name.onChange(event.currentTarget.value)}
        onBlur={fields.name.onBlur}
        onFocus={fields.name.onFocus}
      />
      
      <input
        type="number"
        value={fields.age.value}
        onChange={(event) => fields.age.onChange(parseInt(event.currentTarget.value))}
        onBlur={fields.age.onBlur}
        onFocus={fields.age.onFocus}
      />
      
      <button type="submit">Submit</button>
    </form>
  )
}
```

### API Reference

#### ReactForm

| name                | type                                          | description                                                                                |
|---------------------|-----------------------------------------------|--------------------------------------------------------------------------------------------|
| values              | `Values`                                      | form values                                                                                |
| errors              | `Errors`                                      | form errors (***Note:*** array field error stored in format `{ error: null, errors: [] }`) |
| fields              | `ReactFields<Schema>`                         | form fields (contains object of ReactFields)                                               |
| isValid             | `boolean`                                     | is form valid                                                                              |
| isDirty             | `boolean`                                     | is form changed                                                                            |
| isValidationPending | `boolean`                                     | is validating                                                                              |
| onSubmit            | `() => void`                                  | submit form                                                                                |
| onValidate          | `() => void`                                  | validate form                                                                              |
| onReset             | `() => void`                                  | reset form values                                                                          |
| setValues           | `(payload: Values) => void`                   | change values                                                                              |
| setErrors           | `(payload: ErrorsSchemaPayload) => void`      | set outer errors                                                                           |
| setPartialValues    | `(payload: PartialRecursive<Values>) => void` | partially change values                                                                    |

#### ReactField (Primary)

| name          | type                             | description        |
|---------------|----------------------------------|--------------------|
| value         | `T`                              | field value        |
| error         | `FieldError`                     | field outer error  |
| isValid       | `boolean`                        | is field valid     |
| isDirty       | `boolean`                        | is field changed   |
| onChangeError | `(newError: FieldError) => void` | change field error |
| onChange      | `(newValue: T) => void`          | change field value |
| onFocus       | `() => void`                     | focus field        |
| onBlur        | `() => void`                     | blur field         |

#### ReactField (Array)

| name          | type                                                        | description                                             |
|---------------|-------------------------------------------------------------|---------------------------------------------------------|
| values        | `(T extends ReadyFieldsGroupSchema ? ReactFields<T> : T)[]` | array field values                                      |
| error         | `FieldError`                                                | array field error                                       |
| isValid       | `boolean`                                                   | is array field valid                                    |
| isDirty       | `boolean`                                                   | is array field changed                                  |
| onReset       | `() => void`                                                | reset array field values                                |
| onChange      | `(values: Payload[]) => void`                               | change array field values                               |
| onChangeError | `(error: FieldError) => void`                               | change array field outer error                          |
| onPush        | `(payload: PushPayload<Payload>) => void`                   | push item [reference](../core/create-array-field)       |
| onSwap        | `(payload: SwapPayload) => void`                            | swap items [reference](../core/create-array-field)      |
| onMove        | `(payload: MovePayload) => void`                            | move item [reference](../core/create-array-field)       |
| onInsert      | `(payload: InsertOrReplacePayload<Payload>) => void`        | insert item [reference](../core/create-array-field)     |
| onUnshift     | `(payload: UnshiftPayload<Payload>) => void`                | unshift item(s) [reference](../core/create-array-field) |
| onRemove      | `(payload: RemovePayload) => void`                          | remove item [reference](../core/create-array-field)     |
| onPop         | `(payload: void) => void`                                   | pop item [reference](../core/create-array-field)        |
| onReplace     | `(payload: InsertOrReplacePayload<Payload>) => void`        | replace item [reference](../core/create-array-field)    |