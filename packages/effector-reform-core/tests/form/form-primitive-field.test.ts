import { describe, test, expect, vi } from 'vitest';
import { allSettled, createEffect, fork, sample } from 'effector';
import { createForm } from '../../lib';

describe('Form primitive field tests', () => {
  test('change value', async () => {
    const scope = fork();
    const form = createForm({ schema: { field: '' } });

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: form.changed,
      target: fx,
    });

    await allSettled(form.fields.field.change, { scope, params: 'test' });

    expect(scope.getState(form.$values)).toStrictEqual({ field: 'test' });
    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('change error', async () => {
    const scope = fork();
    const form = createForm({ schema: { field: '' } });

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: form.errorsChanged,
      target: fx,
    });

    await allSettled(form.fields.field.changeError, { scope, params: 'error' });

    expect(scope.getState(form.$errors)).toStrictEqual({ field: 'error' });
    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('focus', async () => {
    const scope = fork();
    const form = createForm({ schema: { field: '' } });

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: form.fields.field.focused,
      target: fx,
    });

    await allSettled(form.fields.field.focus, { scope });

    expect(scope.getState(form.fields.field.$isFocused)).toBeTruthy();
    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('blur', async () => {
    const scope = fork();
    const form = createForm({ schema: { field: '' } });

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: form.fields.field.blurred,
      target: fx,
    });

    await allSettled(form.fields.field.focus, { scope });
    await allSettled(form.fields.field.blur, { scope });

    expect(scope.getState(form.fields.field.$isFocused)).toBeFalsy();
    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('reset', async () => {
    const scope = fork();
    const form = createForm({ schema: { field: '' } });

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: form.changed,
      target: fx,
    });

    await allSettled(form.fields.field.change, { scope, params: 'value' });
    await allSettled(form.fields.field.reset, { scope });

    expect(scope.getState(form.$values)).toStrictEqual({ field: '' });
    expect(mockedFn).toHaveBeenCalledTimes(2);
  });
});
