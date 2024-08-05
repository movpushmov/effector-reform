import { describe, test, expect, vi } from 'vitest';
import { allSettled, createEffect, fork, sample } from 'effector';
import { createArrayField, createForm } from '../../lib';

describe('Form array field tests', () => {
  test('change value', async () => {
    const scope = fork();
    const form = createForm({
      schema: { field: createArrayField<{ name: string }>([]) },
    });

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: form.changed,
      target: fx,
    });

    await allSettled(form.fields.field.change, {
      scope,
      params: [{ name: 'John' }],
    });

    expect(scope.getState(form.$values)).toStrictEqual({
      field: [{ name: 'John' }],
    });

    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('change error', async () => {
    const scope = fork();
    const form = createForm({
      schema: { field: createArrayField<{ name: string }>([]) },
    });

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: form.errorsChanged,
      target: fx,
    });

    await allSettled(form.fields.field.changeError, {
      scope,
      params: 'some error',
    });

    expect(scope.getState(form.$errors)).toStrictEqual({
      field: { error: 'some error', errors: [] },
    });

    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('change field suberror', async () => {
    const scope = fork();
    const form = createForm({
      schema: {
        field: createArrayField<{ name: string }>([{ name: 'string' }]),
      },
    });

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: form.errorsChanged,
      target: fx,
    });

    await allSettled(form.setErrors, {
      scope,
      params: {
        'field.0.name': 'error',
      },
    });

    expect(scope.getState(form.$errors)).toStrictEqual({
      field: { error: null, errors: [{ name: 'error' }] },
    });

    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('push', async () => {
    const scope = fork();
    const form = createForm({
      schema: { field: createArrayField<{ name: string }>([]) },
    });

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: form.changed,
      target: fx,
    });

    await allSettled(form.fields.field.push, {
      scope,
      params: { name: 'John' },
    });

    expect(scope.getState(form.$values)).toStrictEqual({
      field: [{ name: 'John' }],
    });

    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('swap', async () => {
    const scope = fork();
    const form = createForm({
      schema: { field: createArrayField<number>([1, 2]) },
    });

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: form.changed,
      target: fx,
    });

    await allSettled(form.fields.field.swap, {
      scope,
      params: { indexA: 0, indexB: 1 },
    });

    expect(scope.getState(form.$values)).toStrictEqual({
      field: [2, 1],
    });

    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('move', async () => {
    const scope = fork();
    const form = createForm({
      schema: { field: createArrayField<number>([0, 1, 2, 3]) },
    });

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: form.changed,
      target: fx,
    });

    await allSettled(form.fields.field.move, {
      scope,
      params: { from: 1, to: 4 },
    });

    expect(scope.getState(form.$values)).toStrictEqual({
      field: [0, 2, 3, 1],
    });

    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('insert', async () => {
    const scope = fork();
    const form = createForm({
      schema: { field: createArrayField<number>([0, 1, 2, 3]) },
    });

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: form.changed,
      target: fx,
    });

    await allSettled(form.fields.field.insert, {
      scope,
      params: { value: 10, index: 2 },
    });

    expect(scope.getState(form.$values)).toStrictEqual({
      field: [0, 1, 10, 2, 3],
    });

    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('unshift', async () => {
    const scope = fork();
    const form = createForm({
      schema: { field: createArrayField<number>([0, 1, 2, 3]) },
    });

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: form.changed,
      target: fx,
    });

    await allSettled(form.fields.field.unshift, {
      scope,
      params: 10,
    });

    expect(scope.getState(form.$values)).toStrictEqual({
      field: [10, 0, 1, 2, 3],
    });

    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('remove', async () => {
    const scope = fork();
    const form = createForm({
      schema: { field: createArrayField<number>([0, 1, 2, 3]) },
    });

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: form.changed,
      target: fx,
    });

    await allSettled(form.fields.field.remove, {
      scope,
      params: { index: 1 },
    });

    expect(scope.getState(form.$values)).toStrictEqual({
      field: [0, 2, 3],
    });

    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('pop', async () => {
    const scope = fork();
    const form = createForm({
      schema: { field: createArrayField<number>([0, 1, 2, 3]) },
    });

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: form.changed,
      target: fx,
    });

    await allSettled(form.fields.field.pop, {
      scope,
    });

    expect(scope.getState(form.$values)).toStrictEqual({
      field: [0, 1, 2],
    });

    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('replace', async () => {
    const scope = fork();
    const form = createForm({
      schema: { field: createArrayField<number>([0, 1, 2, 3]) },
    });

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: form.changed,
      target: fx,
    });

    await allSettled(form.fields.field.replace, {
      scope,
      params: { value: 10, index: 1 },
    });

    expect(scope.getState(form.$values)).toStrictEqual({
      field: [0, 10, 2, 3],
    });

    expect(mockedFn).toHaveBeenCalledTimes(1);
  });
});
