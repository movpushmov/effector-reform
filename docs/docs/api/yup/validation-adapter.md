---
id: validation-adapter
sidebar_position: 1
title: yupAdapter
tags:
  - Validation
  - Yup
---

Create adapter for form validation from yup schema

### Formulae

```ts
function yupAdapter<Schema extends AnySchema>(
  schema: AnySchema
): AsyncValidationFn<Schema>;
```

### Example

```ts
import { createForm } from '@effector-reform/core';
import { yupAdapter } from "@effector-reform/yup";
import { string, object } from 'yup';

const form = createForm({
  schema: {
    nick: '',
    email: '',
  },

  validation: yupAdapter(
    object({
      nick: string()
        .min(4, 'nick-min-limit')
        .max(16, 'nick-max-limit')
        .required('nick-required'),
      email: string().email('invalid-email').required('email-required'),
    }),
  ),
});
```