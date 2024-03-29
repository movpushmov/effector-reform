import { describe, expect, test } from '@jest/globals';
import { createArrayField, createForm } from '@effector-reform/core';
import { yupAdapter } from '../lib';
import { allSettled, fork } from 'effector';
import { array, number, object, string } from 'yup';
import { useForm } from '@effector-reform/react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'effector-react';

describe('Yup adapter', () => {
  test('yup', async () => {
    const scope = fork();
    const form = createForm({
      schema: {
        a: 5,
        b: createArrayField<number>([]),
        c: {
          d: 'string',
        },
      },
      validation: yupAdapter(
        object({
          a: number().max(20),
          b: array().of(number()).min(5).max(10),
          c: object({ d: string().min(2).max(10) }),
        }),
      ),
    });

    await allSettled(form.validate, { scope });
    await allSettled(form.fields.c.d.change, { scope, params: 'h' });
    await allSettled(form.submit, { scope });

    const errors = scope.getState(form.$errors);

    expect(errors).toStrictEqual({
      a: null,
      b: {
        error: 'b field must have at least 5 items',
        errors: [],
      },
      c: { d: 'c.d must be at least 2 characters' },
    });
  });

  test('change field with yup validation', async () => {
    const scope = fork();
    const form = createForm({
      schema: {
        a: '',
      },

      validation: yupAdapter(
        object({
          a: string().min(4, 'min 4'),
        }),
      ),
    });

    function Component() {
      const { fields } = useForm(form);

      return (
        <>
          <input
            value={fields.a.value}
            onChange={(e) => fields.a.onChange(e.currentTarget.value)}
          />
          <p data-testid="field value">{fields.a.value}</p>
          <p data-testid="field error">{fields.a.error}</p>
        </>
      );
    }

    const { container } = render(
      <Provider value={scope}>
        <Component />
      </Provider>,
    );

    const input = container.querySelector('input')!;
    const value = container.querySelector('p[data-testid="field value"]')!;
    const error = container.querySelector('p[data-testid="field error"]')!;

    await userEvent.type(input, 'a');
    await userEvent.type(input, 'b');
    await userEvent.type(input, 'c');
    await userEvent.type(input, 'd');
    await userEvent.type(input, 'e');
    await userEvent.type(input, 'f');
    await userEvent.type(input, 'g');
    await userEvent.type(input, 'h');

    expect(value.textContent).toBe('abcdefgh');
    expect(error.textContent).toBe('min 4');
  });
});
