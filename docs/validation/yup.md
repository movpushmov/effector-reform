#  Yup validation

You can validate your form with yup library, for this
you should install adapter.

## Installation

::: code-group
```bash [npm]
npm install @effector-reform/yup
```
```bash [yarn]
yarn add @effector-reform/yup
```
```bash [pnpm]
pnpm add @effector-reform/yup
```
:::

## Example

```ts
import { createForm } from '@effector-reform/core';
import { yupAdapter } from '@effector-reform/yup';
import { object, string } from 'yup';

const form = createForm({
  schema: {
    nick: '',
  },

  validation: yupAdapter(
    object({
      nick: string().min(4, 'min 4'),
    }),
  ),
});

form.fields.nick.change('hi');

console.log(form.fields.nick.$error.getState()); // min 4
```
