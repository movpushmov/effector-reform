import { describe, expect, test } from 'vitest';
import { createForm } from '../../lib';
import { allSettled, fork, serialize } from 'effector';

describe('form work with scopes', () => {
  test('values written in scope', async () => {
    const scope = fork();
    const form = createForm({
      schema: {
        a: '',
        b: 0,
        c: [] as string[],
      },
    });

    await allSettled(form.fill, {
      scope,
      params: {
        values: {
          a: 'hello world',
          b: 42,
          c: ['a', 'b', 'c'],
        },
      },
    });

    expect(serialize(scope)).toMatchObject({
      [form.fields.a.$value.sid!]: 'hello world',
      [form.fields.b.$value.sid!]: 42,
      [form.fields.c.$values.sid!]: ['a', 'b', 'c'],
    });
  });
});
