import {
  FormErrors,
  FormType,
  FormValues,
  PartialRecursive,
  ReadyFieldsGroupSchema,
} from '@effector-composable-forms/core';
import { useProvidedScope, useUnit } from 'effector-react';
import { useEffect, useMemo } from 'react';
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

  isValid: boolean;
  isDirty: boolean;
  isValidationPending: boolean;
  submit: () => void;
  validate: () => void;
  reset: () => void;
  setValues: (payload: Values) => void;
  setErrors: (payload: Errors) => void;
  setPartialValues: (payload: PartialRecursive<Values>) => void;
  setPartialErrors: (payload: PartialRecursive<Errors>) => void;
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

  const { values, errors, ...formParams } = useUnit(form);
  const fields = useMemo(
    () => getFields(form.fields, scope) as ReactFields<T['fields']>,
    [form.fields, values, errors],
  );

  useEffect(() => {
    return () => {
      if (props?.resetOnUnmount) {
        formParams.reset();
      }
    };
  }, []);

  return {
    values,
    errors,
    fields,
    ...formParams,
  };
}
