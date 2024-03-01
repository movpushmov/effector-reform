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
  FormErrors,
  FormType,
  FormValues,
  SyncValidationFn,
} from './types';
import { setFormPartialValues, mapSchema, clearFormOuterErrors } from './utils';

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

  if (validationStrategies)
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
