# Understanding composable fields concept

## Field is independent entity

In form libraries like `formik`, `effector-react-form` and `react-hook-form` field is part of form, it can't exist without a form.
But in `effector-reform` it's not. In `effector-reform` you can define field out of form and use it.

```ts
// field example

import { createField } from '@effector-reform/core';

const field = createField(0);

field.change(20);

console.log(field.$value); // 20
```

```tsx
// usage in react example

import { createField } from '@effector-reform/core';
import { useField } from '@effector-reform/react';

const nameField = createField('');

const Component = () => {
  const { value, onChange } = useField(nameField);

  return (
    <>
      <input value={value} onChange={(e) => onChange(e.currentTarget.value)} />
    </>
  );
};
```

## Forms are composable

You can create form with already defined fields. If
you don't want to copy field on create form, you can
set `copyOnCreateForm` flag to `false` (default `true`)

```ts
import { createField, createForm } from '@effector-reform/core';

const nameField = createField('', { copyOnCreateForm: false });
const copiedAgeField = createField(0);

const form = createForm({
  schema: {
    name: nameField,
    age: copiedAgeField,
  },
});

form.fill({
  values: { name: 'Edward', age: 20 },
});

console.log(nameField.$value.getState()); // Edward
console.log(copiedAgeField.$value.getState()); // 0
```
