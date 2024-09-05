import {
  Effect,
  attach,
  createEffect,
  createEvent,
  createStore,
  sample,
  EventCallable,
  combine,
} from 'effector';
import {
  AnySchema,
  PartialRecursive,
  UserFormSchema,
  copyGroup,
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
  setFormValues,
  mapSchema,
  clearFormErrors,
  setFormErrors,
} from './mapper';
import { resetForm } from './helpers/reset';
import { contractAdapter, isContract } from './helpers';

import isEqual from 'fast-deep-equal';

interface FormInnerMeta {
  /**
   * need to call submittedAndValidatedEvent after "validated" event
   */
  needSav: boolean;
  triggerIsDirty: boolean;
}

export function createForm<T extends AnySchema>(options: CreateFormOptions<T>) {
  const {
    schema,
    validation = (() => null) as unknown as SyncValidationFn<
      UserFormSchema<UserFormSchema<T>>
    >,
    validationStrategies = ['submit', 'change', 'blur', 'focus'],
    clearOuterErrorsOnSubmit = validationStrategies.includes('submit'),
  } = options;

  const fields = copyGroup(prepareFieldsSchema(schema));
  const {
    $errors,
    $values,
    $isValid,
    $api,
    focused,
    blurred,
    addBatchTask,
    metaChanged,
  } = mapSchema(fields);

  const $snapshot = createStore({ ...$values.getState() });

  const $isDirty = createStore(false);
  const $isChanged = combine(
    $values,
    $snapshot,
    (values, snapshot) => !isEqual(values, snapshot),
  );

  const $innerMeta = createStore<FormInnerMeta>({
    needSav: false,
    triggerIsDirty: true,
  });

  type Fields = typeof fields;
  type Errors = FormErrors<Fields>;
  type Values = FormValues<Fields>;

  const clearOuterErrorsFx = attach({
    source: $api,
    effect: (api) => clearFormErrors(api, addBatchTask, 'outer'),
  });

  const clearInnerErrorsFx = attach({
    source: $api,
    effect: (api) => clearFormErrors(api, addBatchTask, 'inner'),
  });

  const resetFx = attach({
    source: $api,
    effect: (api) => resetForm(api, addBatchTask),
  });

  const setValuesFx = attach({
    source: $api,
    effect: (api, values: any) => setFormValues(values, api, addBatchTask),
  });

  const setInnerErrorsFx = attach({
    source: $api,
    effect: (api, errors: any) =>
      setFormErrors(errors, api, addBatchTask, 'inner', true),
  });

  const setOuterErrorsFx = attach({
    source: $api,
    effect: (api, errors: any) =>
      setFormErrors(errors, api, addBatchTask, 'outer', true),
  });

  const fill = createEvent<{
    values?: PartialRecursive<Values>;
    errors?: ErrorsSchemaPayload;
    triggerIsDirty?: boolean;
  }>('<form fill>');

  const clear = createEvent('<form full clear>');
  const clearOuterErrors = createEvent('<form clear outer errors>');
  const clearInnerErrors = createEvent('<form clear inner errors>');

  const changed = createEvent<FormValues<Fields>>('<form changed>');
  const errorsChanged = createEvent<Errors>('<form errors changed>');

  const submit = createEvent<void>('<form submit>');
  const submitted = createEvent<FormValues<Fields>>('<form submitted>');

  const validate = createEvent<void>('<form validate>');
  const validated = createEvent<Values>('<form validated>');
  const validationFailed = createEvent<Values>('<validation failed>');
  const validatedAndSubmitted = createEvent<Values>(
    '<form validated and submitted>',
  );

  const changeInnerMeta = createEvent<Partial<FormInnerMeta>>();
  const forceUpdateSnapshot = createEvent();

  const reset = createEvent('<form reset>');

  const preparedValidationFn = isContract(validation)
    ? contractAdapter(validation)
    : validation;

  const validateFx = createEffect(preparedValidationFn) as Effect<
    Values,
    PartialRecursive<Errors> | null,
    Error
  >;

  const $isValidationPending = validateFx.pending;

  sample({
    clock: changeInnerMeta,
    source: $innerMeta,
    fn: (innerMeta, changedParams) => ({ ...innerMeta, ...changedParams }),
    target: $innerMeta,
  });

  const uniqueValidationStrategies = [...new Set(validationStrategies)];
  for (const strategy of uniqueValidationStrategies) {
    switch (strategy) {
      case 'submit': {
        sample({
          clock: submitted,
          target: [
            validate,
            changeInnerMeta.prepend(() => ({ needSav: true })),
          ],
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

  if (!uniqueValidationStrategies.includes('submit')) {
    sample({
      clock: submitted,
      source: {
        isValid: $isValid,
        isValidationPending: $isValidationPending,
      },
      filter: ({ isValid, isValidationPending }) =>
        isValid && !isValidationPending,
      fn: (_, values) => values,
      target: validatedAndSubmitted,
    });
  }

  sample({
    clock: [validatedAndSubmitted, forceUpdateSnapshot],
    source: $values,
    fn: (values) => ({ ...values }),
    target: $snapshot,
  });

  sample({
    clock: reset,
    target: resetFx,
  });

  sample({
    clock: $values,
    target: changed,
  });

  sample({
    clock: $errors,
    target: errorsChanged,
  });

  sample({
    clock: fill,
    filter: (data) => Boolean(data.values),
    fn: (data) => data.values!,
    target: setValuesFx,
  });

  sample({
    clock: fill,
    filter: (data) => Boolean(data.errors),
    fn: (data) => data.errors!,
    target: setOuterErrorsFx,
  });

  sample({
    clock: fill,
    fn: (data) => ({
      triggerIsDirty:
        data.triggerIsDirty !== undefined ? data.triggerIsDirty : false,
    }),
    target: changeInnerMeta,
  });

  sample({
    clock: $values,
    source: $innerMeta,
    filter: (meta) => meta.triggerIsDirty,
    fn: () => true,
    target: $isDirty,
  });

  sample({
    clock: $values,
    target: changeInnerMeta.prepend(() => ({ triggerIsDirty: true })),
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

  sample({
    clock: clearInnerErrors,
    target: clearInnerErrorsFx,
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
    clock: validateFx.done,
    filter: ({ result }) => !result,
    fn: ({ params }) => params,
    target: validated,
  });

  sample({
    clock: validated,
    target: clearInnerErrorsFx,
  });

  sample({
    clock: validateFx.doneData as EventCallable<any>,
    filter: Boolean,
    target: [
      setInnerErrorsFx,
      validationFailed,
      changeInnerMeta.prepend(() => ({ needSav: false })),
    ],
  });

  sample({
    clock: validated,
    source: $innerMeta,
    filter: ({ needSav }) => needSav,
    fn: (_, values) => values,
    target: [
      validatedAndSubmitted,
      changeInnerMeta.prepend(() => ({ needSav: false })),
    ],
  });

  return {
    $errors,
    $values,
    $snapshot,
    $isDirty,
    $isValid,
    $isChanged,

    $isValidationPending,

    fields,
    metaChanged,

    changed,
    errorsChanged,

    submit,
    submitted,

    reset,
    clear,
    clearOuterErrors,
    clearInnerErrors,

    validate,
    validated,
    validationFailed,
    validatedAndSubmitted,

    forceUpdateSnapshot,
    fill,

    '@@unitShape': () => ({
      errors: $errors,
      values: $values,
      snapshot: $snapshot,
      isValidationPending: $isValidationPending,

      isChanged: $isChanged,
      isDirty: $isDirty,
      isValid: $isValid,

      submit,
      validate,
      reset,
      clear,
      clearOuterErrors,
      clearInnerErrors,
      forceUpdateSnapshot,

      fill,
    }),
  } as FormType<Fields, Values, Errors>;
}
