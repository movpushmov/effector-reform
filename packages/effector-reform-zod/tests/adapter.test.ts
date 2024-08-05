import { describe, expect, test } from 'vitest';
import { createArrayField, createForm } from '@effector-reform/core';
import { zodAdapter } from '../lib';
import { z } from 'zod';
import { allSettled, fork } from 'effector';

describe('Zod adapter', () => {
  test('zod', async () => {
    const scope = fork();
    const form = createForm({
      schema: {
        a: 5,
        b: createArrayField<number>([]),
        c: { d: 'string' },
      },
      validation: zodAdapter(
        z.object({
          a: z.number().max(20),
          b: z.array(z.number()).min(5).max(10),
          c: z.object({ d: z.string().min(2).max(10) }),
        }),
      ),
    });

    await allSettled(form.validate, { scope });
    await allSettled(form.fields.c.d.change, { scope, params: 'h' });
    await allSettled(form.submit, { scope });

    const errors = scope.getState(form.$errors);

    expect(errors).toStrictEqual({
      a: null,
      b: {
        error: 'Array must contain at least 5 element(s)',
        errors: [],
      },
      c: { d: 'String must contain at least 2 character(s)' },
    });
  });

  test('clear not settled errors', async () => {
    const scope = fork();
    const form = createForm({
      schema: {
        a: '',
        b: '',
      },
      validation: zodAdapter(
        z.object({
          a: z.string().min(2, 'min 2'),
          b: z.string().min(4, 'min 4'),
        }),
      ),
    });

    await allSettled(form.setValues, { scope, params: { a: 'a', b: 'a' } });

    expect(scope.getState(form.$errors)).toStrictEqual({
      a: 'min 2',
      b: 'min 4',
    });

    await allSettled(form.fields.a.change, { scope, params: 'aa' });

    expect(scope.getState(form.$errors)).toStrictEqual({
      a: null,
      b: 'min 4',
    });
  });
});
