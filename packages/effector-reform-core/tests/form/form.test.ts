import { describe, jest, expect, test } from '@jest/globals';
import { allSettled, createEffect, fork, sample } from 'effector';
import { createForm } from '../../lib';

describe('Form tests', () => {
  test('Change partial primary fields values', async () => {
    const scope = fork();
    const form = createForm({ schema: { a: 5, b: '' } });

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
    const form = createForm({ schema: { a: [0, 10] } });

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
    const form = createForm({ schema: { a: [0, 10] } });

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

  test('errors batch test', async () => {
    const scope = fork();
    const form = createForm({ schema: { a: '', b: '', c: '', d: '', e: '' } });

    const mockedFn = jest.fn();
    const errorsChangedFx = createEffect(mockedFn);

    sample({
      clock: form.$errors,
      target: errorsChangedFx,
    });

    await allSettled(form.setErrors, {
      scope,
      params: {
        a: 'error 1',
        b: 'error 2',
        c: 'error 3',
        d: 'error 4',
        e: 'error 5',
      },
    });

    expect(mockedFn).toBeCalledTimes(1);
  });

  test('values batch test', async () => {
    const scope = fork();
    const form = createForm({ schema: { a: '', b: '', c: '', d: '', e: '' } });

    const mockedFn = jest.fn();
    const valuesChangedFx = createEffect(mockedFn);

    sample({
      clock: form.$values,
      target: valuesChangedFx,
    });

    await allSettled(form.setValues, {
      scope,
      params: {
        a: 'value 1',
        b: 'value 2',
        c: 'value 3',
        d: 'value 4',
        e: 'value 5',
      },
    });

    expect(mockedFn).toBeCalledTimes(1);
  });

  test.todo('Change primary fields errors');

  test.todo('Change array field errors');

  test.todo('Clear outer errors');

  test.todo('Submit');

  test.todo('Validate');

  test.todo('Is dirty');

  test.todo('Is valid');
});
