---
id: validation-adapter
sidebar_position: 1
title: zodAdapter
tags:
  - Validation
  - Zod
---

Create adapter for form validation from zod schema

### Formulae

```ts
function zodAdapter<Schema extends AnySchema>(
  schema: ZodObject<ZodRawShape>,
): AsyncValidationFn<Schema>
```

### Example

```ts
import { createForm } from '@effector-reform/core';
import { zodAdapter } from '@effector-reform/zod';
import { z } from 'zod';

const form = createForm({
  schema: { a: '' },
  validation: zodAdapter(
    z.object({
      a: z.string().min(5, 'msg'),
    }),
  ),
});
```