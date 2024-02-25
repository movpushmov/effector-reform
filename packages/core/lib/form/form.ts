import {
  Effect,
  attach,
  createEffect,
  createEvent,
  createStore,
  sample,
  EventCallable,
} from 'effector';
import {
  AnySchema,
  PartialRecursive,
  UserFormSchema,
  forkGroup,
  prepareFieldsSchema,
} from '../fields';
import type {
  ComposeOptions,
  FormErrors,
  FormType,
  FormValues,
  SyncValidationFn,
} from './types';
import { setFormPartialValues, mapSchema, clearFormOuterErrors } from './utils';

export function compose<T extends AnySchema>(
  schema: T,
  options: ComposeOptions<UserFormSchema<T>> = {},
) {
  const {
    validation = (() => {}) as unknown as SyncValidationFn<
      UserFormSchema<UserFormSchema<T>>
    >,
    // validationStrategies = ['submit', 'change', 'blur'],
    clearOuterErrorsOnSubmit = true,
  } = options;

  const fields = forkGroup(prepareFieldsSchema(schema));
  const { $errors, $values, $isValid, $api } = mapSchema(fields);

  const $isDirty = createStore(false);

  type Fields = typeof fields;
  type Errors = FormErrors<Fields>;
  type Values = FormValues<Fields>;

  const clearOuterErrorsFx = attach({
    source: $api,
    effect: clearFormOuterErrors,
  });

  const setValuesFx = attach({
    source: $api,
    effect: (api, values: any) => setFormPartialValues(values, api),
  });

  const setErrorsFx = attach({
    source: $api,
    effect: (api, values: any) => setFormPartialValues(values, api),
  });

  const setValues = createEvent<Values>();
  const setPartialValues = createEvent<PartialRecursive<Values>>();

  const setErrors = createEvent<Errors>();
  const setPartialErrors = createEvent<PartialRecursive<Errors>>();

  const clearOuterErrors = createEvent();

  const changed = createEvent<FormValues<Fields>>();
  const errorsChanged = createEvent<Errors>();

  const submit = createEvent<void>();
  const submitted = createEvent<FormValues<Fields>>();

  const validate = createEvent<void>();
  const validated = createEvent<void>();

  const reset = createEvent();

  const validateFx = createEffect(validation) as Effect<
    Values,
    PartialRecursive<Errors> | null,
    Error
  >;

  const $isValidationPending = validateFx.pending;

  sample({
    clock: $values,
    target: changed,
  });

  sample({
    clock: [setValues, setPartialValues],
    target: setValuesFx,
  });

  sample({
    clock: [setErrors, setPartialErrors],
    target: setErrorsFx,
  });

  sample({
    clock: $values,
    source: $isDirty,
    filter: Boolean,
    fn: () => true,
    target: $isDirty,
  });

  sample({
    clock: submit,
    target: validate,
  });

  sample({
    clock: clearOuterErrors,
    target: clearOuterErrorsFx,
  });

  if (clearOuterErrorsOnSubmit) {
    sample({
      clock: submit,
      target: clearOuterErrors,
    });
  }

  sample({
    clock: validate,
    source: $values,
    target: validateFx,
  });

  sample({
    clock: validateFx.doneData as EventCallable<any>,
    filter: (result) => result === null,
    target: validated,
  });

  sample({
    clock: validateFx.doneData as EventCallable<any>,
    filter: Boolean,
    target: setPartialErrors,
  });

  sample({
    clock: validateFx.doneData as EventCallable<any>,
    source: $values,
    filter: (_, result) => result !== null,
    fn: (values) => values,
    target: submitted,
  });

  sample({
    clock: validated,
    source: $values,
    target: submitted,
  });

  return {
    $errors,
    $values,
    $isDirty,
    $isValid,

    $isValidationPending,

    fields,

    changed,
    errorsChanged,

    submit,
    submitted,

    reset,

    validate,
    validated,

    setValues,
    setErrors,

    setPartialValues,
    setPartialErrors,

    '@@unitShape': () => ({
      errors: $errors,
      values: $values,
      isValidationPending: $isValidationPending,

      isDirty: $isDirty,
      isValid: $isValid,

      submit,
      validate,
      reset,

      setValues,
      setErrors,

      setPartialValues,
      setPartialErrors,
    }),
  } as FormType<Fields, Values, Errors>;
}
