import {
  compose,
  createArrayField,
  createField,
} from '@effector-composable-forms/core';
import { Form, useForm } from '@effector-composable-forms/react';
import { useEffect } from 'react';

const nick = createField<string>('');
const password = createField<string>('');

const array = createArrayField<{ a: number; b: number }>([], {
  forkOnCompose: false,
});

const arr = createArrayField<number>([]);

const form = compose({ nick, password, array, arr });

export function Test() {
  const f = useForm(form);

  useEffect(() => {
    f.setValues({
      arr: [1, 6],
      array: [{ a: 10, b: 20 }],
      nick: 'test',
      password: 'password',
    });
  }, []);

  console.log(f.values, f.fields);

  return (
    <>
      <Form model={form}>
        <button type="submit">click me!</button>
      </Form>
    </>
  );
}
