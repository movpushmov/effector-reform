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

    await allSettled(form.fill, {
      scope,
      params: { values: { a: 'a', b: 'a' } },
    });

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

  test('works with refine', async () => {
    const scope = fork();
    const form = createForm({
      schema: {
        password: '',
        confirm: '',
      },
      validation: zodAdapter(
        z
          .object({
            password: z.string(),
            confirm: z.string(),
          })
          .refine((data) => data.password === data.confirm, {
            message: "don't match",
            path: ['confirm'],
          }),
      ),
    });

    await allSettled(form.fill, {
      scope,
      params: { values: { password: '1234', confirm: '00' } },
    });

    expect(scope.getState(form.$errors)).toStrictEqual({
      password: null,
      confirm: "don't match",
    });

    await allSettled(form.fields.confirm.change, { scope, params: '1234' });

    expect(scope.getState(form.$errors)).toStrictEqual({
      password: null,
      confirm: null,
    });
  });

  test('works with discriminated union', async () => {
    const scope = fork();

    const commonSchema = z.object({ name: z.string().nonempty() });

    const form = createForm({
      schema: {
        name: '',
        contractType: '',
        contractId: '',
      },
      validation: zodAdapter(
        z.discriminatedUnion('contractType', [
          commonSchema.extend({
            contractType: z.literal('a'),
            contractId: z.literal('', {
              errorMap: () => ({ message: 'should be empty' }),
            }),
          }),
          commonSchema.extend({
            contractType: z.literal('b'),
            contractId: z.string().nonempty(),
          }),
        ]),
      ),
    });

    await allSettled(form.fill, {
      scope,
      params: {
        values: { name: 'Test', contractType: 'a', contractId: '123' },
      },
    });

    expect(scope.getState(form.$errors)).toStrictEqual({
      name: null,
      contractType: null,
      contractId: 'should be empty',
    });

    await allSettled(form.fields.contractType.change, {
      scope,
      params: 'b',
    });

    expect(scope.getState(form.$errors)).toStrictEqual({
      name: null,
      contractType: null,
      contractId: null,
    });
  });

  test('errors has right order', async () => {
    const scope = fork();
    const form = createForm({
      schema: {
        email: '',
      },
      validation: zodAdapter(
        z.object({
          email: z.string().min(2, 'invalid length').email('invalid email'),
        }),
      ),
    });

    await allSettled(form.fill, {
      scope,
      params: { values: { email: '1' } },
    });

    expect(scope.getState(form.$errors).email).toBe('invalid length');
  });
});
