import { createField, createForm } from '@effector-reform/core';
import { useForm } from '@effector-reform/react';

import { createStore, sample } from 'effector';
import { useUnit } from 'effector-react';

const nameField = createField<string>('', { forkOnCreateForm: false });

const form = createForm({
  schema: {
    name: nameField,
  },
});

const $message = createStore(':(');

sample({
  clock: nameField.changed,
  fn: (name) => (name === 'Edward' ? 'nice!' : ':('),
  target: $message,
});

export function FieldOutOfForm() {
  const { fields } = useForm(form);
  const message = useUnit($message);

  return (
    <>
      <p>type "Edward"</p>

      <input
        value={fields.name.value}
        onChange={(e) => fields.name.onChange(e.currentTarget.value)}
      />

      <p>message: {message}</p>
    </>
  );
}
