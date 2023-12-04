import { createField } from './effector-composable-forms/field.ts'
import { compose } from './effector-composable-forms/form.ts'
import { createEvent, sample } from 'effector'

const phone = createField('');
const login = createField('');
const password = createField('');

const retryPassword = password.fork();

const signUpForm = compose({ phone, login, password, retryPassword });
const signInForm = compose(({ login, password }));

sample({
  clock: signUpForm.$values,
  fn: (values) => values.phone,
  target: createEvent()
});

sample({
  clock: signUpForm.$errors,
  fn: (errors) => errors.phone,
  target: createEvent()
});
