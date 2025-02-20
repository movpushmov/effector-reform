import { describe, expect, test } from 'vitest';
import { allSettled, createStore, fork } from 'effector';
import { createForm, ValidationStrategy } from '../../lib';

describe('form validation strategies', () => {
  test('validation strategies works after dynamic change', async () => {
    const $strategies = createStore<ValidationStrategy[]>([
      'blur',
      'change',
      'focus',
      'submit',
    ]);

    const scope = fork();

    const form = createForm({
      schema: {
        a: '',
      },
      validation: (values) => {
        return {
          a: values.a.length < 4 ? 'error' : null,
        };
      },
      validationStrategies: $strategies,
    });

    await allSettled(form.fields.a.blur, { scope });

    expect(scope.getState(form.fields.a.$error)).toBe('error');

    await allSettled($strategies, { scope, params: ['submit'] });

    await allSettled(form.fields.a.change, { scope, params: 'aaaa' });

    expect(scope.getState(form.fields.a.$error)).toBe('error');

    await allSettled(form.submit, { scope });

    expect(scope.getState(form.fields.a.$error)).toBe(null);
  });
});
