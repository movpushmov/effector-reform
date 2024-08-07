# Zod validation

You can validate your form with zod library, for this
you should install adapter.

## Installation

::: code-group
```bash [npm]
npm install @effector-reform/zod
```
```bash [yarn]
yarn add @effector-reform/zod
```
```bash [pnpm]
pnpm add @effector-reform/zod
```
:::

## Example

```ts
import { createForm } from '@effector-reform/core';
import { zodAdapter } from '@effector-reform/zod';
import { z } from 'zod';

const form = createForm({
  schema: { a: '' },
  validation: zodAdapter(
    z.object({
      a: z.string().min(5, 'min 5'),
    }),
  ),
});

form.fields.a.change('hi');

console.log(form.fields.a.$error.getState()); // min 5
```
