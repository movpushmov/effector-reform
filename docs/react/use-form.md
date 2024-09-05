# useForm

Use form model in react component

**Type Signature:**

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

**Example Usage:**

```tsx
import { useForm } from '@effector-reform/react';
import { createForm } from '@effector-reform/core';

const form = createForm({
  schema: {
    name: '',
    age: 18,
  },
});

function Form() {
  const { fields, onSubmit } = useForm(form);

  return (
    <form onSubmit={onSubmit}>
      <input
        value={fields.name.value}
        onChange={(event) => fields.name.onChange(event.currentTarget.value)}
        onBlur={fields.name.onBlur}
        onFocus={fields.name.onFocus}
      />

      <input
        type="number"
        value={fields.age.value}
        onChange={(event) =>
          fields.age.onChange(parseInt(event.currentTarget.value))
        }
        onBlur={fields.age.onBlur}
        onFocus={fields.age.onFocus}
      />

      <button type="submit">Submit</button>
    </form>
  );
}
```

## API

| name                      | type                                                                                                                  | description                                                                                                                               |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| values                    | `Values`                                                                                                            | form values                                                                                                                               |
| errors                    | `Errors`                                                                                                            | form errors (**_Note:_** array field error stored in format `{ error: null, errors: [] }`)                                      |
| fields                    | `ReactFields<Schema>`                                                                                               | form fields (contains object of ReactFields)                                                                                              |
| snapshot                  | Values                                                                                                                | contains last saved snapshot of values (update on every `submitted and validated` event or by `onForceUpdateSnapshot`)                |
| isValid                   | `boolean`                                                                                                           | is form valid                                                                                                                             |
| isChanged                 | `boolean`                                                                                                           | `true` if snapshot not equals to values, `false` if equal                                                                             |
| isDirty                   | `boolean`                                                                                                           | is form changed                                                                                                                           |
| isValidationPending       | `boolean`                                                                                                           | is validating                                                                                                                             |
| onSubmit                  | `() => void`                                                                                                        | submit form                                                                                                                               |
| onValidate                | `() => void`                                                                                                        | validate form                                                                                                                             |
| onReset                   | `() => void`                                                                                                        | reset form values                                                                                                                         |
| fill                      | `(payload: { values?: PartialRecursive<Values>; errors?: ErrorsSchemaPayload; triggerIsDirty?: boolean; }) => void` | set values/errors of form without trigger isDirty (by default triggerIsDirty = false, but you can pass true if you want trigger isDirty) |
| onClearOuterErrors        | `() => void`                                                                                                        | clear form outer errors                                                                                                                   |
| onClearInnerErrors        | `() => void`                                                                                                        | clear form inner errors                                                                                                                   |
| `onForceUpdateSnapshot` | `() => void`                                                                                                        | force update of snapshot                                                                                                                  |
