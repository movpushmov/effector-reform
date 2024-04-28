import { createArrayField, createForm } from '@effector-reform/core';
import { useForm } from '../../lib';

const form = createForm({ schema: { field: createArrayField<number>([]) } });

export function ArrayFieldForm() {
  const { fields } = useForm(form);

  return (
    <>
      {fields.field.values.map((value, index) => (
        <button
          onClick={() => fields.field.onRemove({ index })}
          data-index={index}
        >
          {value}
        </button>
      ))}

      <button
        data-testid="add-button"
        onClick={() => fields.field.onPush(Math.random())}
      >
        add number
      </button>
    </>
  );
}
