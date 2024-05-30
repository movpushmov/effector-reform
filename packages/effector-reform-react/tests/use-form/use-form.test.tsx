import { describe, test, expect } from '@jest/globals';
import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DefaultFormComponent } from '../components/default';
import { ValidatedFormComponent } from '../components/validated';
import { ArrayFieldForm } from '../components/array-field';
import { MetaForm } from '../components/meta';

function click(target: HTMLElement) {
  return act(() => userEvent.click(target));
}

describe('useForm', () => {
  test.only('value change', async () => {
    const { container } = render(<DefaultFormComponent />);

    const input = container.querySelector('input')!;
    const p = container.querySelector('[data-testid="field value"]')!;

    expect(p.textContent).toBe('a');

    await act(async () => {
      await userEvent.type(input, 'abcd', { delay: 20 });
    });

    expect(p.textContent).toBe('aabcd');
  });

  test('error change', async () => {
    const { container } = render(<DefaultFormComponent />);

    const button = container.querySelector('button')!;
    const p = container.querySelector('[data-testid="field error"]')!;

    expect(p.textContent).toBe('');

    await click(button);

    expect(p.textContent).toBe('some error');
  });

  test('value changed in form with validation', async () => {
    const { container } = render(<ValidatedFormComponent />);

    const input = container.querySelector('input')!;
    const valueP = container.querySelector('[data-testid="field value"]')!;
    const errorP = container.querySelector('[data-testid="field error"]')!;

    await userEvent.type(input, 'a');
    await userEvent.type(input, 'b');
    await userEvent.type(input, 'c');
    await userEvent.type(input, 'd');
    await userEvent.type(input, 'e');
    await userEvent.type(input, 'f');
    await userEvent.type(input, 'g');
    await userEvent.type(input, 'h');

    expect(input.value).toBe('abcdefgh');
    expect(valueP.textContent).toBe('abcdefgh');
    expect(errorP.textContent).toBe('length must be lower than 4');
  });

  test('array field form works correctly', async () => {
    const { container } = render(<ArrayFieldForm />);

    const addButton = container.querySelector(
      'button[data-testid="add-button"]',
    ) as HTMLButtonElement;

    await click(addButton);
    await click(addButton);
    await click(addButton);

    expect(container.querySelectorAll('button[data-index]').length).toBe(3);

    await click(container.querySelector('button[data-index="1"]')!);

    expect(container.querySelectorAll('button[data-index]').length).toBe(2);
  });

  test('meta', async () => {
    const { container } = render(<MetaForm />);

    const button = container.querySelector('button')!;
    const text = container.querySelector('p')!;

    expect(text.textContent).toBe('is positive: false');

    await click(button);

    expect(text.textContent).toBe('is positive: true');
  });
});
