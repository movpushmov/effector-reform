---
title: Getting started
---

# Getting started

## Installation

::: warning
This is documentation for **next** version of effector-reform, which
is not production ready yet and based on experimental `@effector/model` library.
:::

::: code-group
```bash [npm]
npm install @effector-reform/core@latest
```
```bash [yarn]
yarn add @effector-reform/core@latest
```
```bash [pnpm]
pnpm add @effector-reform/core@latest
```
:::

::: tip
In SSR project you must add @effector-reform/core in "factories"
list in [effector babel plugin](https://effector.dev/en/api/effector/babel-plugin/#configuration-factories)
:::

## React bindings

::: code-group
```bash [npm]
npm install @effector-reform/react
```
```bash [yarn]
yarn add @effector-reform/react
```
```bash [pnpm]
pnpm add @effector-reform/react
```
:::

## Writing first form

As an example, we will write a simple form with `name` and `age` fields.

```ts
import { createForm } from "@effector-reform/core";
import { allSettled, createEvent, fork, sample } from "effector";

const scope = fork();

const form = createForm({
  schema: {
    name: '',
    age: 0
  },
});

const nameChanged = createEvent<string>();

sample({
  clock: nameChanged,
  target: form.fields.name.change,
});

await allSettled(nameChanged, { scope, params: 'Edward' });

console.log(scope.getState(form.fields.name.$value)); // Edward
```
