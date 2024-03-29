import { createForm } from '@effector-reform/core';
import { useForm } from '../../lib';

const validatedForm = createForm({
  schema: { a: '' },
  validation: (values) => {
    if (values.a.length > 4) {
      return {
        a: 'length must be lower than 4',
      };
    }

    return null;
  },
});

export function ValidatedFormComponent() {
  const { fields } = useForm(validatedForm);

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
