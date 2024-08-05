import { describe, test, expect, vi } from 'vitest';
import { allSettled, createEffect, fork, sample } from 'effector';
import { createArrayField, createField, createForm } from '../../lib';

describe('Form tests', () => {
  test('Change partial primitive fields values', async () => {
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

  test.todo('Change primitive fields values');

  test.todo('Change array fields values');

  test.todo('Change partial primitive field errors');

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
    const form = createForm({
      schema: {
        a: '',
        b: '',
        c: '',
        m: 0,
        d: '',
        e: '',
        f: [],
        g: { h: [], s: '', m: 0 },
      },
    });

    const mockedFn = vi.fn();
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
        f: 'error 6',
        'g.h': 'error 7',
        'g.s': 'error 8',
        'g.m': 'error 9',
        m: 'error 10',
      },
    });

    expect(mockedFn).toHaveBeenCalledTimes(1);
    expect(scope.getState(form.$errors)).toStrictEqual({
      a: 'error 1',
      b: 'error 2',
      c: 'error 3',
      d: 'error 4',
      e: 'error 5',
      f: {
        error: 'error 6',
        errors: [],
      },
      m: 'error 10',
      g: {
        h: {
          error: 'error 7',
          errors: [],
        },
        s: 'error 8',
        m: 'error 9',
      },
    });
  });

  test('values batch test', async () => {
    const scope = fork();
    const form = createForm({ schema: { a: '', b: '', c: '', d: '', e: '' } });

    const mockedFn = vi.fn();
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

    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test.todo('Clear outer errors');

  test.todo('Submit');

  test('submitted and validated', async () => {
    const scope = fork();
    const form = createForm({
      schema: { a: '', b: '', c: '', d: '', e: '' },
    });

    const mockedValidatedFn = vi.fn();
    const mockedValidatedFx = createEffect(mockedValidatedFn);

    const mockedValidatedAndSubmittedFn = vi.fn();
    const mockedValidatedAndSubmittedFx = createEffect(
      mockedValidatedAndSubmittedFn,
    );

    sample({
      clock: form.validatedAndSubmitted,
      target: mockedValidatedAndSubmittedFx,
    });

    sample({
      clock: form.validated,
      target: mockedValidatedFx,
    });

    await allSettled(form.fields.a.change, { scope, params: '123' });
    await allSettled(form.fields.b.change, { scope, params: '321' });

    expect(mockedValidatedAndSubmittedFn).toHaveBeenCalledTimes(0);
    expect(mockedValidatedFn).toHaveBeenCalledTimes(2);

    await allSettled(form.submit, { scope });

    expect(mockedValidatedAndSubmittedFn).toHaveBeenCalledTimes(1);
    expect(mockedValidatedFn).toHaveBeenCalledTimes(3);
  });

  test('Validate', async () => {
    const scope = fork();
    const form = createForm({
      schema: { a: '', b: '', c: '', d: '', e: '' },
      validation: (values) => (!values.b ? { b: 'test' } : null),
    });

    await allSettled(form.validate, { scope });

    expect(scope.getState(form.$errors)).toStrictEqual({
      a: null,
      b: 'test',
      c: null,
      d: null,
      e: null,
    });
  });

  test('reset', async () => {
    const scope = fork();
    const form = createForm({ schema: { a: 0, b: '' } });

    await allSettled(form.setPartialValues, {
      scope,
      params: { a: 10, b: 'hello' },
    });

    expect(scope.getState(form.$values)).toStrictEqual({ a: 10, b: 'hello' });

    await allSettled(form.reset, { scope });

    expect(scope.getState(form.$values)).toStrictEqual({ a: 0, b: '' });
  });

  test.todo('Is dirty changed');

  test.todo('Is valid changed');

  test('meta', async () => {
    const mockedFn = vi.fn();

    const scope = fork();

    const form = createForm({
      schema: {
        a: createField<number, { isDisabled: boolean }>(5),
        b: createArrayField<number, { isKnown: boolean }>([]),
      },
    });

    sample({
      clock: form.metaChanged,
      target: createEffect(mockedFn),
    });

    await allSettled(form.fields.a.changeMeta, {
      scope,
      params: { isDisabled: true },
    });

    await allSettled(form.fields.b.changeMeta, {
      scope,
      params: { isKnown: false },
    });

    expect(scope.getState(form.fields.a.$meta)).toStrictEqual({
      isDisabled: true,
    });

    expect(scope.getState(form.fields.b.$meta)).toStrictEqual({
      isKnown: false,
    });

    expect(mockedFn).toHaveBeenCalledTimes(2);
  });

  test('nullable fields', async () => {
    const scope = fork();
    const form = createForm<{ a: string | null }>({ schema: { a: null } });

    expect(scope.getState(form.fields.a.$value)).toBe(null);

    await allSettled(form.fields.a.change, { scope, params: 'hello' });

    expect(scope.getState(form.fields.a.$value)).toBe('hello');
  });
});
