import {
  compose,
  createArrayField,
  createField,
} from '@effector-composable-forms/core';
import { Form, useField, useForm } from '@effector-composable-forms/react';
import { createEvent, sample } from 'effector';
import { useUnit } from 'effector-react';

const nick = createField<string>('');
const password = createField<string>('');

const array = createArrayField<{ a?: number; b?: number }>([], {
  forkOnCompose: false,
});

const form = compose({ nick, password, array });

const e = createEvent();

sample({
  clock: e,
  fn: () => 'test',
  target: [form.fields.nick.change, nick.change],
});

export function Test() {
  const props = useForm(form);
  const field = useField(nick);
  const e1 = useUnit(e);

  console.log(props, field);

  return (
    <>
      <Form model={form}></Form>
      <button onClick={e1}>click me!</button>
    </>
  );
}
