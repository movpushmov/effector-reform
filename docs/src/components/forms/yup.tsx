import { createForm } from '@effector-reform/core';
import { yupAdapter } from '@effector-reform/yup';
import { object, string } from 'yup';
import { useForm } from '@effector-reform/react';

const form = createForm({
  schema: {
    nick: '',
    email: '',
  },

  validation: yupAdapter(
    object({
      nick: string()
        .min(4, 'nick-min-limit')
        .max(16, 'nick-max-limit')
        .required('nick-required'),
      email: string().email('invalid-email').required('email-required'),
    }),
  ),
});

export const FormWithYup = () => {
  const { fields } = useForm(form);

  return (
    <>
      <form>
        <input
          value={fields.nick.value}
          onChange={(e) => fields.nick.onChange(e.currentTarget.value)}
        />
        <input
          value={fields.email.value}
          onChange={(e) => fields.email.onChange(e.currentTarget.value)}
        />
      </form>
    </>
  );
};
