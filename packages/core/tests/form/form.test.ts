import { describe, expect, test } from '@jest/globals';
import { allSettled, fork } from 'effector';
import { createForm } from '../../lib';

describe('Form tests', () => {
  test('Change partial primary fields values', async () => {
    const scope = fork();
    const form = createForm({ a: 5, b: '' });

    expect(scope.getState(form.$values)).toMatchObject({
      a: 5,
      b: '',
    });

    await allSettled(form.setPartialValues, { scope, params: { a: 10 } });

    expect(scope.getState(form.$values)).toMatchObject({
      a: 10,
      b: '',
    });
  });

  test('Change partial array fields values', async () => {
    const scope = fork();
    const form = createForm({ a: [0, 10] });

    expect(scope.getState(form.$values)).toMatchObject({
      a: [0, 10],
    });

    await allSettled(form.setPartialValues, { scope, params: { a: [500] } });

    expect(scope.getState(form.$values)).toMatchObject({
      a: [500],
    });
  });

  test.todo('Change primary fields values');

  test.todo('Change array fields values');

  test.todo('Change partial primary field errors');

  test('Change partial array field errors', async () => {
    const scope = fork();
    const form = createForm({ a: [0, 10] });

    await allSettled(form.setErrors, {
      scope,
      params: { a: 'error error' },
    });

    expect(scope.getState(form.$errors)).toMatchObject({
      a: {
        error: 'error error',
        errors: [],
      },
    });
  });

  test.todo('Change primary fields errors');

  test.todo('Change array field errors');

  test.todo('Clear outer errors');

  test.todo('Submit');

  test.todo('Validate');

  test.todo('Is dirty');

  test.todo('Is valid');
});
