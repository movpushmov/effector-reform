import { createArrayField, createForm } from '@effector-reform/core';
import { useForm } from '@effector-reform/react';
import { createStore, sample } from 'effector';
import { useUnit } from 'effector-react';

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

const $message = createStore<string | null>(null);

sample({
  clock: form.submitted,
  fn: (values) => JSON.stringify(values),
  target: $message,
});

export const BaseForm = () => {
  const { onSubmit, fields } = useForm(form);
  const message = useUnit($message);

  return (
    <>
      {message && <p>submitted with: {message}</p>}

      <form onSubmit={onSubmit}>
        <div>
          <p style={{ margin: '12px 0 4px 0' }}>string field</p>
          <input
            value={fields.a.value}
            onChange={(e) => fields.a.onChange(e.currentTarget.value)}
          />
        </div>

        <div>
          <p style={{ margin: '12px 0 4px 0' }}>number field</p>
          <input
            value={fields.b.value}
            inputMode="numeric"
            onChange={(e) => fields.b.onChange(parseInt(e.currentTarget.value))}
          />
        </div>

        <div>
          <p style={{ margin: '12px 0 4px 0' }}>array field</p>
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {fields.c.values.map((num, index) => (
                <span onClick={() => fields.c.onRemove({ index })}>{num}</span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => fields.c.onPush(Math.random())}
            >
              add num
            </button>
          </div>
        </div>

        <div>
          <p style={{ margin: '12px 0 4px 0' }}>field in group</p>

          <input
            value={fields.d.e.value}
            onChange={(e) => fields.d.e.onChange(e.currentTarget.value)}
          />
        </div>

        <div>
          <p style={{ margin: '12px 0 4px 0' }}>array with subfields</p>
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {fields.d.f.values.map((group) => (
                <input
                  value={group.name.value}
                  onChange={(e) => group.name.onChange(e.currentTarget.value)}
                />
              ))}
            </div>

            <p style={{ margin: '12px 0 4px 0' }}>
              friends:{' '}
              {fields.d.f.values.map((group) => group.name.value).join(', ')}
            </p>

            <button
              type="button"
              onClick={() => fields.d.f.onPush({ name: '' })}
            >
              add friend
            </button>
          </div>

          <button type="submit">submit</button>
        </div>
      </form>
    </>
  );
};
