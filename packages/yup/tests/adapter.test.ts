import { describe, expect, test } from '@jest/globals';
import {
  createArrayField,
  createField,
  createForm,
} from '@effector-reform/core';
import { yupAdapter } from '../lib';
import { allSettled, fork } from 'effector';
import { array, number, object, string } from 'yup';

describe('Yup adapter', () => {
  test('yup', async () => {
    const scope = fork();
    const form = createForm(
      {
        a: createField(5),
        b: createArrayField<number>([]),
        c: { d: createField('string') },
      },
      {
        validation: yupAdapter(
          object({
            a: number().max(20),
            b: array().of(number()).min(5).max(10),
            c: object({ d: string().min(2).max(10) }),
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
        error: 'b field must have at least 5 items',
        errors: [],
      },
      c: { d: 'c.d must be at least 2 characters' },
    });
  });
});
