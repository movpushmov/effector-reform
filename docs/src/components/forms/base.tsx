import { createArrayField, createForm } from '@effector-reform/core';
import { useForm } from '@effector-reform/react';

const form = createForm({
  schema: {
    a: 'string',
    b: 0,
    c: [] as number[],
    d: {
      e: 'string 2',
      f: createArrayField<{ name: string }>([]),
    },
  },
});

export const BaseForm = () => {
  const { fields } = useForm(form);

  return (
    <>
      <form>
        <p>string field</p>
        <input
          value={fields.a.value}
          onChange={(e) => fields.a.onChange(e.currentTarget.value)}
        />

        <p>number field</p>
        <input
          value={fields.b.value}
          inputMode="numeric"
          onChange={(e) => fields.b.onChange(parseInt(e.currentTarget.value))}
        />

        <p>array field</p>
        <div>
          {fields.c.values.map((num, index) => (
            <span onClick={() => fields.c.remove({ index })}>{num}</span>
          ))}

          <button onClick={() => fields.c.push(Math.random())}>add num</button>
        </div>

        <p>field in group</p>
        <input
          value={fields.d.e.value}
          onChange={(e) => fields.d.e.onChange(e.currentTarget.value)}
        />

        <p>array with subfields</p>
        <div>
          {fields.d.f.values.map((group) => (
            <input
              value={group.name.value}
              onChange={(e) => group.name.onChange(e.currentTarget.value)}
            />
          ))}

          <button onClick={() => fields.d.f.push({ name: '' })}>
            add friend
          </button>
        </div>
      </form>
    </>
  );
};
