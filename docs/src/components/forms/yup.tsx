import { createForm } from '@effector-reform/core';
import { yupAdapter } from '@effector-reform/yup';
import { object, string } from 'yup';
import { useForm } from '@effector-reform/react';

const form = createForm({
  schema: {
    a: '',
  },
  validation: yupAdapter(
    object({
      a: string().min(5, 'msg'),
    }),
  ),
});

export const FormWithYup = () => {
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
