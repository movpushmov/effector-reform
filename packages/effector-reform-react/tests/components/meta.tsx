import { createField, createForm } from '@effector-reform/core';
import { useForm } from '../../lib';

const form = createForm({
  schema: {
    a: createField<number, { isPositive: boolean }>(5, {
      meta: { isPositive: false },
    }),
  },
});

export function MetaForm() {
  const { fields } = useForm(form);

  return (
    <>
      <p data-testid="text">
        is positive: {fields.a.meta.isPositive.toString()}
      </p>

      <button
        data-testid="switch"
        onClick={() =>
          fields.a.onChangeMeta({ isPositive: !fields.a.meta.isPositive })
        }
      >
        change is positive
      </button>
    </>
  );
}
