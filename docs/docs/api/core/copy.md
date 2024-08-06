---
id: create-field
sidebar_position: 4
title: copy
tags:
  - Core
  - Copy fields
---

Copies passed field

### Formulae

```ts
export function copy<T extends PrimitiveField>(field: T): T;
export function copy<T extends ArrayField<any>>(field: T): T;
export function copy<T extends PrimitiveField | ArrayField<any>>(field: T): T;
```

### Examples

```ts
import { createField, copy } from "@effector-reform/core";

const field = createField(10);
const anotherField = copy(field);

field.change(20);

console.log(field.$value.getState() === anotherField.$value.getState()); // false
```
