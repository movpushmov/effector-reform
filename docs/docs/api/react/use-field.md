---
id: use-field
sidebar_position: 1
title: useField
tags:
  - React
  - Primitive field
---

Use primitive field model in react component

### Formulae

```ts
function useField<T extends PrimaryField<any>>(field: T);
```

### Examples

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

### API Reference

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
