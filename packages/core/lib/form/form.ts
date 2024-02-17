import { StoreValue, createEvent, sample } from 'effector';
import { AnySchema, forkGroup, prepareFieldsSchema } from '../fields';
import { FormType, FormValues } from './types';
import { watchSchema } from './utils';

export function compose<T extends AnySchema>(schema: T) {
  const fields = forkGroup(prepareFieldsSchema(schema));
  const { $errors, $values } = watchSchema(fields);

  type Fields = typeof fields;
  type Errors = StoreValue<typeof $errors>;
  type Values = StoreValue<typeof $values>;

  const changed = createEvent<FormValues<Fields>>();
  const errorsChanged = createEvent<Errors>();

  const submit = createEvent<void>();
  const submitted = createEvent<FormValues<Fields>>();

  const validate = createEvent<void>();
  const validated = createEvent<void>();

  sample({
    clock: $values,
    target: changed,
  });

  sample({
    clock: submit,
    target: validate,
  });

  sample({
    clock: validated,
    source: $values,
    target: submitted,
  });

  return {
    $errors,
    $values,

    fields,

    changed,
    errorsChanged,
    submit,
    submitted,
    validate,
    validated,

    '@@unitShape': () => ({
      errors: $errors,
      values: $values,

      submit: submit,
      validate: validate,
    }),
  } as FormType<Fields, Values, Errors>;
}
