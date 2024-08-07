# useForm

Use form model in react component

__Type Signature:__

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

__Example Usage:__

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


## API

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
