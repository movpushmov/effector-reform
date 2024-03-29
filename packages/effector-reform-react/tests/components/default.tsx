import { useForm } from '../../lib';
import { createForm } from '@effector-reform/core';

const form = createForm({
  schema: {
    age: 'a',
  },
});

export function DefaultFormComponent() {
  const { fields } = useForm(form);

  return (
    <>
      <input
        value={fields.age.value}
        onChange={(e) => fields.age.onChange(e.currentTarget.value)}
      />
      <button
        data-testid="set-error"
        onClick={() => fields.age.onChangeError('some error')}
      />
      <p data-testid="field value">{fields.age.value}</p>
      <p data-testid="field error">{fields.age.error}</p>
    </>
  );
}
