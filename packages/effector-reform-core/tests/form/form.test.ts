import { describe, test, expect, vi } from 'vitest';
import { allSettled, createEffect, fork, sample } from 'effector';
import { createArrayField, createField, createForm } from '../../lib';
import { obj, str } from '@withease/contracts';
import { watchCalls } from '../utils';

describe('Form tests', () => {
  test('Change partial primitive fields values', async () => {
    const scope = fork();
    const form = createForm({ schema: { a: 5, b: '' } });

    expect(scope.getState(form.$values)).toMatchObject({
      a: 5,
      b: '',
    });

    await allSettled(form.fill, { scope, params: { values: { a: 10 } } });

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

    await allSettled(form.fill, { scope, params: { values: { a: [500] } } });

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

    await allSettled(form.fill, {
      scope,
      params: { errors: { a: 'error error' } },
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

    await allSettled(form.fill, {
      scope,
      params: {
        errors: {
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

  test('setValues', async () => {
    const scope = fork();
    const form = createForm({
      schema: { a: '', b: '', c: '', d: '', e: '' },
    });

    const mockedFn = vi.fn();
    const valuesChangedFx = createEffect(mockedFn);

    sample({
      clock: form.$values,
      target: valuesChangedFx,
    });

    await allSettled(form.fill, {
      scope,
      params: {
        values: {
          a: 'value 1',
          b: 'value 2',
          c: 'value 3',
          d: 'value 4',
          e: 'value 5',
        },
      },
    });

    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('form values isolated in scopes', async () => {
    const scopeA = fork();
    const scopeB = fork();

    const form = createForm({ schema: { value: 0 } });

    await allSettled(form.fields.value.change, { scope: scopeA, params: 10 });
    await allSettled(form.fields.value.change, { scope: scopeB, params: 20 });

    expect(scopeA.getState(form.$values)).toStrictEqual({ value: 10 });
    expect(scopeB.getState(form.$values)).toStrictEqual({ value: 20 });
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

  test('"validated and submitted" event doesn\'t called after "validated" without "submitted"', async () => {
    const scope = fork();
    const form = createForm({
      schema: { a: '', b: '', c: '', d: '', e: '' },
      validation: (values) =>
        values.a.length > 4 ? null : { a: 'some error' },
    });

    const fn = watchCalls(form.validatedAndSubmitted);

    await allSettled(form.fields.a.change, { scope, params: 'aa' });
    await allSettled(form.submit, { scope });

    expect(fn).toBeCalledTimes(0);

    await allSettled(form.fields.a.change, { scope, params: 'some string' });

    expect(fn).toBeCalledTimes(0);

    await allSettled(form.submit, { scope });

    expect(fn).toBeCalledTimes(1);
  });

  test('"validated and subbmited" event called after "submit" without any validation strategies', async () => {
    const scope = fork();
    const form = createForm({
      schema: { a: '', b: '', c: '', d: '', e: '' },
      validation: (values) =>
        values.a.length > 4 ? null : { a: 'some error' },
      validationStrategies: [],
    });

    const fn = watchCalls(form.validatedAndSubmitted);

    await allSettled(form.validate, { scope });

    await allSettled(form.fields.a.change, { scope, params: 'aa' });
    await allSettled(form.submit, { scope });

    expect(fn).toBeCalledTimes(0);

    await allSettled(form.fields.a.change, { scope, params: 'some string' });
    await allSettled(form.submit, { scope });

    expect(fn).toBeCalledTimes(0);

    await allSettled(form.validate, { scope });
    await allSettled(form.submit, { scope });

    expect(fn).toBeCalledTimes(1);
  });

  test('validate', async () => {
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

  test('contracts validation errors', async () => {
    const scope = fork();
    const form = createForm({
      schema: { a: '' },
      validation: obj({
        a: str,
      }),
    });

    // @ts-expect-error -- specially setting value with wrong data type
    await allSettled(form.fill, { scope, params: { values: { a: 0 } } });

    expect(scope.getState(form.$errors)).toStrictEqual({
      a: 'a: expected string, got number',
    });
  });

  test('contracts validation', async () => {
    const scope = fork();
    const form = createForm({
      schema: { a: '' },
      validation: obj({
        a: str,
      }),
    });

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: form.validated,
      target: fx,
    });

    // @ts-expect-error -- specially setting value with wrong data type
    await allSettled(form.fill, { scope, params: { values: { a: 0 } } });

    expect(mockedFn).toBeCalledTimes(0);

    await allSettled(form.fill, { scope, params: { values: { a: '123' } } });

    expect(mockedFn).toBeCalledTimes(1);
  });

  test('reset', async () => {
    const scope = fork();
    const form = createForm({ schema: { a: 0, b: '' } });

    await allSettled(form.fill, {
      scope,
      params: { values: { a: 10, b: 'hello' } },
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

  test('if flag is not passed in "fill" event — isDirty doesn\'t changed', async () => {
    const scope = fork();
    const form = createForm<{ a: string }>({ schema: { a: '' } });

    expect(scope.getState(form.$isDirty)).toBe(false);

    await allSettled(form.fill, { scope, params: { values: { a: '123' } } });

    expect(scope.getState(form.$isDirty)).toBe(false);

    await allSettled(form.fields.a.change, { scope, params: '321' });

    expect(scope.getState(form.$isDirty)).toBe(true);
  });

  test('if "true" is passed in "fill" event — isDirty changed', async () => {
    const scope = fork();
    const form = createForm<{ a: string }>({ schema: { a: '' } });

    expect(scope.getState(form.$isDirty)).toBe(false);

    await allSettled(form.fill, {
      scope,
      params: { values: { a: '123' }, triggerIsDirty: true },
    });

    expect(scope.getState(form.$isDirty)).toBe(true);
  });

  test('if "false" is passed in "fill" event — isDirty doesn\'t changed', async () => {
    const scope = fork();
    const form = createForm<{ a: string }>({ schema: { a: '' } });

    expect(scope.getState(form.$isDirty)).toBe(false);

    await allSettled(form.fill, {
      scope,
      params: { values: { a: '123' }, triggerIsDirty: false },
    });

    expect(scope.getState(form.$isDirty)).toBe(false);
  });

  test('clearOuterErrors', async () => {
    const scope = fork();
    const form = createForm<{ a: string; b: string }>({
      schema: { a: '', b: '' },
    });

    await allSettled(form.fill, {
      scope,
      params: { errors: { a: '123', b: '321' } },
    });

    expect(scope.getState(form.$errors)).toStrictEqual({ a: '123', b: '321' });

    await allSettled(form.clearOuterErrors, { scope });

    expect(scope.getState(form.$errors)).toStrictEqual({ a: null, b: null });
  });

  test('clearOuterErrorsOnSubmit', async () => {
    const scope = fork();
    const form = createForm<{ a: string; b: string }>({
      schema: { a: '', b: '' },
      clearOuterErrorsOnSubmit: true,
    });

    await allSettled(form.fill, {
      scope,
      params: { errors: { a: '123', b: '321' } },
    });

    await allSettled(form.submit, { scope });

    expect(scope.getState(form.$errors)).toStrictEqual({ a: null, b: null });
  });
});
