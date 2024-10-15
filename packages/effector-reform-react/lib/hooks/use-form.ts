import {
  ErrorsSchemaPayload,
  FormErrors,
  FormType,
  FormValues,
  PartialRecursive,
  ReadyFieldsGroupSchema,
} from '@effector-reform/core';
import { useProvidedScope, useUnit } from 'effector-react';
import { FormEvent, useEffect, useState } from 'react';
import { getFields, subscribe } from './utils';
import { ReactFields } from '../types';

interface UseFormProps {
  resetOnUnmount?: boolean;
}

type ReactForm<
  Schema extends ReadyFieldsGroupSchema,
  Values extends FormValues<any> = FormValues<Schema>,
  Errors extends FormErrors<any> = FormErrors<Schema>,
> = {
  values: Values;
  snapshot: Values;
  errors: Errors;
  fields: ReactFields<Schema>;

  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onValidate: () => void;
  onReset: () => void;
  onClearOuterErrors: () => void;
  onClearInnerErrors: () => void;
  onForceUpdateSnapshot: () => void;

  isChanged: boolean;
  isValid: boolean;
  isValidationPending: boolean;

  fill: (data: {
    values?: PartialRecursive<Values>;
    errors?: ErrorsSchemaPayload;
  }) => void;
};

type AnyForm = FormType<any, any, any>;

export function useForm<
  T extends AnyForm,
  Schema extends ReadyFieldsGroupSchema = T extends FormType<infer K, any, any>
    ? K
    : never,
  Values extends FormValues<any> = T extends FormType<any, infer K, any>
    ? K
    : never,
  Errors extends FormErrors<any> = T extends FormType<any, any, infer K>
    ? K
    : never,
>(form: T, props?: UseFormProps): ReactForm<Schema, Values, Errors> {
  const scope = useProvidedScope();

  const {
    values,
    errors,
    snapshot,
    forceUpdateSnapshot,
    submit,
    reset,
    clearOuterErrors,
    clearInnerErrors,
    validate,
    ...formParams
  } = useUnit(form);

  const [fields, setFields] = useState<ReactFields<T['fields']>>(() =>
    getFields(form.fields, scope),
  );

  useEffect(() => {
    const { unsubscribe } = subscribe(
      [form.$values, form.$errors, form.metaChanged],
      scope,
      () => setFields(getFields(form.fields, scope)),
    );

    return () => {
      unsubscribe();

      if (props?.resetOnUnmount) {
        reset();
      }
    };
  }, []);

  return {
    values,
    errors,
    fields,
    snapshot,

    onSubmit: (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      submit();
    },

    onForceUpdateSnapshot: forceUpdateSnapshot,
    onReset: reset,
    onValidate: validate,
    onClearOuterErrors: clearOuterErrors,
    onClearInnerErrors: clearInnerErrors,

    ...formParams,
  };
}
