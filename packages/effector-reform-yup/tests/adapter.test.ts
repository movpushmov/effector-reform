import { describe, expect, test } from 'vitest';
import { createArrayField, createForm } from '@effector-reform/core';
import { yupAdapter } from '../lib';
import { allSettled, fork } from 'effector';
import { array, number, object, string } from 'yup';

describe('Yup adapter', () => {
  test('yup', async () => {
    const scope = fork();
    const form = createForm({
      schema: {
        a: 5,
        b: createArrayField<number>([]),
        c: {
          d: 'string',
        },
      },
      validation: yupAdapter(
        object({
          a: number().max(20),
          b: array().of(number()).min(5).max(10),
          c: object({ d: string().min(2).max(10) }),
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
        error: 'b field must have at least 5 items',
        errors: [],
      },
      c: { d: 'c.d must be at least 2 characters' },
    });
  });

  test('clear not settled errors', async () => {
    const scope = fork();
    const form = createForm({
      schema: {
        a: '',
        b: '',
      },
      validation: yupAdapter(
        object({
          a: string().min(2, 'min 2'),
          b: string().min(4, 'min 4'),
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
