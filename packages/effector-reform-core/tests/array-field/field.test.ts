import { describe, test, expect, vi } from 'vitest';
import { createArrayField } from '../../lib';
import { allSettled, createEffect, fork, sample } from 'effector';

describe('Array field tests', () => {
  test('push', async () => {
    const scope = fork();
    const field = createArrayField<number>([0]);

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: field.changed,
      target: fx,
    });

    await allSettled(field.push, { scope, params: 1 });

    expect(scope.getState(field.$values)).toStrictEqual([0, 1]);
    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('swap', async () => {
    const scope = fork();
    const field = createArrayField<number>([0, 1]);

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: field.swapped,
      target: fx,
    });

    await allSettled(field.swap, { scope, params: { indexA: 0, indexB: 1 } });

    expect(scope.getState(field.$values)).toStrictEqual([1, 0]);
    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('move', async () => {
    const scope = fork();
    const field = createArrayField<number>([0, 1, 2, 3]);

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: field.moved,
      target: fx,
    });

    await allSettled(field.move, { scope, params: { from: 1, to: 4 } });

    expect(scope.getState(field.$values)).toStrictEqual([0, 2, 3, 1]);
    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('insert', async () => {
    const scope = fork();
    const field = createArrayField<number>([0, 1, 2, 3]);

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: field.inserted,
      target: fx,
    });

    await allSettled(field.insert, { scope, params: { value: 10, index: 2 } });

    expect(scope.getState(field.$values)).toStrictEqual([0, 1, 10, 2, 3]);
    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('unshift', async () => {
    const scope = fork();
    const field = createArrayField<number>([0, 1, 2, 3]);

    await allSettled(field.unshift, { scope, params: 10 });

    expect(scope.getState(field.$values)).toStrictEqual([10, 0, 1, 2, 3]);
  });

  test('remove', async () => {
    const scope = fork();
    const field = createArrayField<number>([0, 1, 2, 3]);

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: field.removed,
      target: fx,
    });

    await allSettled(field.remove, { scope, params: { index: 2 } });

    expect(scope.getState(field.$values)).toStrictEqual([0, 1, 3]);
    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('pop', async () => {
    const scope = fork();
    const field = createArrayField<number>([0, 1, 2, 3]);

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: field.popped,
      target: fx,
    });

    await allSettled(field.pop, { scope });

    expect(scope.getState(field.$values)).toStrictEqual([0, 1, 2]);
    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('replace', async () => {
    const scope = fork();
    const field = createArrayField<number>([0, 1, 2, 3]);

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: field.replaced,
      target: fx,
    });

    await allSettled(field.replace, { scope, params: { index: 2, value: 10 } });

    expect(scope.getState(field.$values)).toStrictEqual([0, 1, 10, 3]);
    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('reset', async () => {
    const scope = fork();
    const field = createArrayField<number>([0]);

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: field.resetCompleted,
      target: fx,
    });

    await allSettled(field.push, { scope, params: 10 });
    await allSettled(field.push, { scope, params: 10 });
    await allSettled(field.push, { scope, params: 10 });
    await allSettled(field.push, { scope, params: 10 });
    await allSettled(field.push, { scope, params: 10 });
    await allSettled(field.push, { scope, params: 10 });

    await allSettled(field.reset, { scope });

    expect(scope.getState(field.$values)).toStrictEqual([0]);
    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('change', async () => {
    const scope = fork();
    const field = createArrayField<number>([0, 1]);

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: field.changed,
      target: fx,
    });

    await allSettled(field.change, { scope, params: [500, 1000, 1500] });

    expect(scope.getState(field.$values)).toStrictEqual([500, 1000, 1500]);
    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('changeError', async () => {
    const scope = fork();
    const field = createArrayField<number>([]);

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: field.errorChanged,
      target: fx,
    });

    expect(scope.getState(field.$error)).toBe(null);

    await allSettled(field.changeError, { scope, params: 'Tessssst' });

    expect(scope.getState(field.$error)).toBe('Tessssst');
    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('array field push & subfield change', async () => {
    const scope = fork();
    const field = createArrayField<{ a: string }>([]);

    await allSettled(field.push, { scope, params: { a: '' } });
    await allSettled(field.push, { scope, params: { a: '' } });
    await allSettled(field.push, { scope, params: { a: '' } });

    const secondField = scope.getState(field.$values)[1];

    await allSettled(secondField.a.change, { scope, params: '123' });

    expect(scope.getState(secondField.a.$value)).toBe('123');
  });

  test('meta', async () => {
    const mockedFn = vi.fn();

    const scope = fork();
    const field = createArrayField<{ a: string }, { isDisabled?: boolean }>([]);

    sample({
      clock: field.metaChanged,
      target: createEffect(mockedFn),
    });

    await allSettled(field.changeMeta, { scope, params: { isDisabled: true } });

    expect(scope.getState(field.$meta)).toStrictEqual({ isDisabled: true });
    expect(mockedFn).toHaveBeenCalledTimes(1);
  });
});
