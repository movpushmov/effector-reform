# useField

Use primitive field model in react component

__Type Signature:__

```ts
function useField<T extends PrimitiveValue, Meta extends object = any>(
  field: PrimitiveField<T, Meta>,
): ReactPrimitiveFieldApi<T, Meta>
```

__Example Usage:__

::: tip
You can use `useField` with field of form for optimization like this:

```ts
const form = createForm({ schema: { name: '' } });

// in react component
const { value, onChange } = useField(form.fields.name);
```

:::

```tsx
import { createField } from "@effector-reform/core";
import { useField } from "@effector-reform/react";

const nameField = createField('');

const Field = () => {
  const field = useField(nameField);

  return (
    <>
      <input
        value={field.value}
        onChange={(event) => field.onChange(event.currentTarget.value)}
        onBlur={field.onBlur}
        onFocus={field.onFocus}
      />
    </>
  );
}
```

## API

| name          | type                               | description        |
| ------------- | ---------------------------------- | ------------------ |
| value         | `T`                              | field value        |
| error         | `FieldError`                     | field outer error  |
| meta          | `Meta`                           | field meta         |
| isValid       | `boolean`                        | is field valid     |
| onChangeError | `(newError: FieldError) => void` | change field error |
| onChange      | `(newValue: T) => void`          | change field value |
| onFocus       | `() => void`                     | focus field        |
| onBlur        | `() => void`                     | blur field         |
| onChangeMeta  | `(meta: Meta) => void`           | change field meta  |
