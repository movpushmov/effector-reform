import { describe, expect, test } from '@jest/globals';
import {
  createArrayField,
  createField,
  createForm,
} from '@effector-reform/core';
import { zodAdapter } from '../lib';
import { z } from 'zod';
import { allSettled, fork } from 'effector';

describe('Zod adapter', () => {
  test('zod', async () => {
    const scope = fork();
    const form = createForm(
      {
        a: createField(5),
        b: createArrayField<number>([]),
        c: { d: createField('string') },
      },
      {
        validation: zodAdapter(
          z.object({
            a: z.number().max(20),
            b: z.array(z.number()).min(5).max(10),
            c: z.object({ d: z.string().min(2).max(10) }),
          }),
        ),
      },
    );

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
});
