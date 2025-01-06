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

import { inOrder } from '../utils';
import { combineEvents } from 'patronum';

interface FormInnerMeta {
  /**
   * need to call submittedAndValidatedEvent after "validated" event
   */
  needSav: boolean;
  /**
   * need to skip validation after "reset" or "clear"
   */
  skipValidation: boolean;
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

  const { sid } = createStore(null);

  const fields = copyGroup(
    prepareFieldsSchema(schema, { baseSid: sid, path: [] }),
  );

  const {
    $errors,
    $values,
    $isValid,
    $api,
    focused,
    blurred,
    addBatchTask,
    metaChanged,
  } = mapSchema(fields, sid);

  const $snapshot = createStore(structuredClone($values.getState()));

  const $isChanged = combine(
    $values,
    $snapshot,
    (values, snapshot) => !isEqual(values, snapshot),
  );

  const $innerMeta = createStore<FormInnerMeta>({
    needSav: false,
    skipValidation: false,
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
  }>('<form fill>');

  const filled = createEvent();

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
  const snapshotUpdated = createEvent();

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

        sample({
          clock: reset,
          target: changeInnerMeta.prepend(() => ({ skipValidation: true })),
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
    fn: (values) => structuredClone(values),
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

  const filledValues = inOrder([
    fill.filter({
      fn: (payload) => Boolean(payload.values) && !payload.errors,
    }),
    changed,
  ]);

  const filledErrors = inOrder([
    fill.filter({
      fn: (payload) => Boolean(payload.errors) && !payload.values,
    }),
    errorsChanged,
  ]);

  const formFilled = inOrder([
    fill.filter({
      fn: (payload) => Boolean(payload.values) && Boolean(payload.errors),
    }),
    combineEvents([changed, errorsChanged]),
  ]);

  sample({
    clock: [filledValues, filledErrors, formFilled],
    fn: () => undefined,
    target: filled,
  });

  sample({
    clock: $snapshot,
    target: snapshotUpdated,
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
    source: { values: $values, meta: $innerMeta },
    filter: ({ meta }) => !meta.skipValidation,
    fn: ({ values }) => values,
    target: validateFx,
  });

  sample({
    clock: validate,
    source: $innerMeta,
    filter: (meta) => meta.skipValidation,
    fn: () => ({ skipValidation: false }),
    target: changeInnerMeta,
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
    clearOuterErrors,
    clearInnerErrors,

    validate,
    validated,
    validationFailed,
    validatedAndSubmitted,

    forceUpdateSnapshot,
    snapshotUpdated,

    fill,
    filled,

    '@@unitShape': () => ({
      errors: $errors,
      values: $values,
      snapshot: $snapshot,
      isValidationPending: $isValidationPending,

      isChanged: $isChanged,
      isValid: $isValid,

      submit,
      validate,
      reset,
      clearOuterErrors,
      clearInnerErrors,
      forceUpdateSnapshot,

      fill,
    }),
  } as FormType<Fields, Values, Errors>;
}
