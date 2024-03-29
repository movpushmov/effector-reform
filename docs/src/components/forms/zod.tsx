import { createForm } from '@effector-reform/core';
import { useForm } from '@effector-reform/react';
import { zodAdapter } from '@effector-reform/zod';
import { z } from 'zod';

const form = createForm({
  schema: { a: '' },
  validation: zodAdapter(
    z.object({
      a: z.string().min(5, 'msg'),
    }),
  ),
});

export const FormWithZod = () => {
  const { fields } = useForm(form);

  return (
    <>
      <form>
        <input
          value={fields.a.value}
          onChange={(e) => fields.a.onChange(e.currentTarget.value)}
        />
      </form>
    </>
  );
};
