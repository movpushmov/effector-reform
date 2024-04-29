import {
  ErrorsSchemaPayload,
  FormErrors,
  FormType,
  FormValues,
  PartialRecursive,
  ReadyFieldsGroupSchema,
} from '@effector-reform/core';
import { useProvidedScope, useUnit } from 'effector-react';
import { FormEvent, useEffect, useMemo } from 'react';
import { getFields } from './utils';
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
  errors: Errors;
  fields: ReactFields<Schema>;

  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onValidate: () => void;
  onReset: () => void;
  onClear: () => void;

  isValid: boolean;
  isDirty: boolean;
  isValidationPending: boolean;

  setValues: (payload: Values) => void;
  setErrors: (payload: ErrorsSchemaPayload) => void;
  setPartialValues: (payload: PartialRecursive<Values>) => void;
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

  const { values, errors, submit, reset, clear, validate, ...formParams } =
    useUnit(form);
  const fields = useMemo<ReactFields<T['fields']>>(
    () => getFields(form.fields, scope),
    [form.fields, values, errors],
  );

  useEffect(() => {
    return () => {
      if (props?.resetOnUnmount) {
        reset();
      }
    };
  }, []);

  return {
    values,
    errors,
    fields,

    onSubmit: (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      submit();
    },

    onReset: reset,
    onValidate: validate,
    onClear: clear,

    ...formParams,
  };
}
