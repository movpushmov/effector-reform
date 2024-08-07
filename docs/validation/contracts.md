# Contracts validation

`effector-reform` has out-of-box support for contracts validation.

## Installation

::: code-group
```bash [npm]
npm install @withease/contracts
```
```bash [yarn]
yarn add @withease/contracts
```
```bash [pnpm]
pnpm install @withease/contracts
```
:::

## Example

```ts
import { createForm } from '@effector-reform/core';
import { obj, str } from "@withease/contracts";

const form = createForm({
  schema: { nick: '' },
  validation: obj({
    nick: str,
  }),
});

form.fields.nick.change(10);

console.log(
  form.fields.nick.$error.getState()
); // nick: expected string, got number
```
