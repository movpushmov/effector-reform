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
  CreateFormOptions,
  ErrorsSchemaPayload,
  FormErrors,
  FormType,
  FormValues,
  SyncValidationFn,
} from './types';
import {
  setFormPartialValues,
  mapSchema,
  clearFormOuterErrors,
  setFormPartialErrors,
} from './utils';

export function createForm<T extends AnySchema>(
  schema: T,
  options: CreateFormOptions<UserFormSchema<T>> = {},
) {
  const {
    validation = (() => {}) as unknown as SyncValidationFn<
      UserFormSchema<UserFormSchema<T>>
    >,
    validationStrategies = ['submit', 'change', 'blur', 'focus'],
    clearOuterErrorsOnSubmit = true,
  } = options;

  const fields = forkGroup(prepareFieldsSchema(schema));
  const { $errors, $values, $isValid, $api, focused, blurred } =
    mapSchema(fields);

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
    effect: (api, errors: any) => setFormPartialErrors(errors, api, 'inner'),
  });

  const setValues = createEvent<Values>('<form set values>');
  const setPartialValues = createEvent<PartialRecursive<Values>>(
    '<form set partial values>',
  );

  const setErrors = createEvent<ErrorsSchemaPayload>('<form set errors>');

  const clearOuterErrors = createEvent('<form clear outer errors>');

  const changed = createEvent<FormValues<Fields>>('<form changed>');
  const errorsChanged = createEvent<Errors>('<form errors changed>');

  const submit = createEvent<void>('<form submit>');
  const submitted = createEvent<FormValues<Fields>>('<form submitted>');

  const validate = createEvent<void>('<form validate>');
  const validated = createEvent<void>('<form validated>');
  const validatedAndSubmitted = createEvent<void>(
    '<form validated and submitted>',
  );

  const reset = createEvent('<form reset>');

  const validateFx = createEffect(validation) as Effect<
    Values,
    PartialRecursive<Errors> | null,
    Error
  >;

  const $isValidationPending = validateFx.pending;

  const uniqueValidationStrategies = [...new Set(validationStrategies)];
  for (const strategy of uniqueValidationStrategies) {
    switch (strategy) {
      case 'submit': {
        sample({
          clock: submitted,
          target: validate,
        });

        break;
      }
      case 'focus': {
        sample({
          clock: focused,
          target: validate,
        });

        break;
      }
      case 'blur': {
        sample({
          clock: blurred,
          target: validate,
        });

        break;
      }
      case 'change': {
        sample({
          clock: changed,
          target: validate,
        });

        break;
      }
    }
  }

  sample({
    clock: $values,
    target: changed,
  });

  sample({
    clock: [setValues, setPartialValues],
    target: setValuesFx,
  });

  sample({
    clock: setErrors,
    target: setErrorsFx,
  });

  sample({
    clock: $values,
    fn: () => true,
    target: $isDirty,
  });

  sample({
    clock: submit,
    source: $values,
    target: submitted,
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
    target: setErrors,
  });

  sample({
    clock: validated,
    source: $values,
    target: validatedAndSubmitted,
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
    validatedAndSubmitted,

    setValues,
    setErrors,

    setPartialValues,

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
    }),
  } as FormType<Fields, Values, Errors>;
}
