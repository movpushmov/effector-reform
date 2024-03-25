import { describe, test, expect } from '@jest/globals';
import { useForm } from '../../lib';
import { createForm } from '@effector-reform/core';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const form = createForm({
  age: 'a',
});

function Component() {
  const { fields } = useForm(form);

  return (
    <>
      <input onChange={(e) => fields.age.onChange(e.currentTarget.value)} />
      <button
        data-testid="set-error"
        onClick={() => fields.age.onChangeError('some error')}
      />
      <p data-testid="field value">{fields.age.value}</p>
      <p data-testid="field error">{fields.age.error}</p>
    </>
  );
}

describe('useForm', () => {
  test('value change', async () => {
    const { container } = render(<Component />);

    const input = container.querySelector('input')!;
    const p = container.querySelector('[data-testid="field value"]')!;

    expect(p.textContent).toBe('a');

    await userEvent.type(input, 'abcd');

    expect(p.textContent).toBe('abcd');
  });

  test('value change', async () => {
    const { container } = render(<Component />);

    const button = container.querySelector('button')!;
    const p = container.querySelector('[data-testid="field error"]')!;

    expect(p.textContent).toBe('');

    await userEvent.click(button);

    expect(p.textContent).toBe('some error');
  });
});
