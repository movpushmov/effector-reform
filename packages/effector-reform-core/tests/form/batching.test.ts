import { describe, test, expect, vi } from 'vitest';
import { allSettled, createEffect, fork, sample } from 'effector';
import { createForm } from '../../lib';
import { combineEvents } from 'patronum';

describe('Form batching tests', () => {
  test('batch form values change', async () => {
    const scope = fork();
    const form = createForm({
      schema: { a: '', b: 0, c: { d: [] as number[] } },
    });

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    sample({
      clock: form.changed,
      target: fx,
    });

    await allSettled(form.setPartialValues, {
      scope,
      params: { a: 'test', b: 123, c: { d: [1, 2] } },
    });

    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('batch form error change', async () => {
    const scope = fork();
    const form = createForm({
      schema: { a: '', b: 0, c: { d: [] } },
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
        a: 'error 1',
        b: 'error 2',
        'c.d': 'error 3',
      },
    });

    expect(mockedFn).toHaveBeenCalledTimes(1);
  });

  test('batch form reset', async () => {
    const scope = fork();
    const form = createForm({
      schema: { a: '', b: 0, c: { d: [] as number[] } },
    });

    const mockedFn = vi.fn();
    const fx = createEffect(mockedFn);

    await allSettled(form.setPartialValues, {
      scope,
      params: { a: 'test', b: 123, c: { d: [1, 2] } },
    });

    await allSettled(form.setErrors, {
      scope,
      params: {
        a: 'error 1',
        b: 'error 2',
        'c.d': 'error 3',
      },
    });

    sample({
      clock: combineEvents([form.changed, form.errorsChanged]),
      target: fx,
    });

    await allSettled(form.reset, { scope });
    expect(mockedFn).toHaveBeenCalledTimes(1);
  });
});
