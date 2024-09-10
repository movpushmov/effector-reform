import { createForm } from '@effector-reform/core';
import { useForm } from '../../lib';
import { FC, useEffect } from 'react';

const form = createForm({ schema: { field: '' } });

export const FormWithCallback: FC<{ onUpdate: () => void }> = ({
  onUpdate,
}) => {
  const { fields } = useForm(form);

  useEffect(onUpdate);

  return (
    <input
      value={fields.field.value}
      onChange={(e) => fields.field.onChange(e.currentTarget.value)}
    />
  );
};
