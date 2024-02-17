import {
  FormType,
  FormFields,
  arrayFieldSymbol,
  primaryFieldSymbol,
} from '@effector-composable-forms/core';
import { useProvidedScope, useUnit } from 'effector-react';
import { useMemo } from 'react';
import { ReactFields } from '../types';
import { Scope, scopeBind } from 'effector';

function getFields<T extends FormFields>(
  fields: T,
  scope: Scope | null,
): ReactFields<T> {
  const node: any = {};

  for (const fieldName in fields) {
    const field = fields[fieldName];

    switch (field.type) {
      case arrayFieldSymbol: {
        node[fieldName] = {
          values: scope
            ? scope.getState(field.$values)
            : field.$values.getState(),
          error: scope ? scope.getState(field.$error) : field.$error.getState(),
          onChange: scope ? scopeBind(field.change, { scope }) : field.change,
          onErrorChange: scope
            ? scopeBind(field.changeError, { scope })
            : field.changeError,
        };

        break;
      }
      case primaryFieldSymbol: {
        node[fieldName] = {
          values: scope
            ? scope.getState(field.$value)
            : field.$value.getState(),
          error: scope ? scope.getState(field.$error) : field.$error.getState(),
          onChange: scope ? scopeBind(field.change, { scope }) : field.change,
          onErrorChange: scope
            ? scopeBind(field.changeError, { scope })
            : field.changeError,
        };

        break;
      }
      default: {
        node[fieldName] = getFields(fields[fieldName] as FormFields, scope);
      }
    }
  }

  return node;
}

export function useForm<T extends FormType<any, any, any>>(form: T) {
  const scope = useProvidedScope();

  const { values, errors, ...formParams } = useUnit(form);
  const fields = useMemo(
    () => getFields(form.fields, scope),
    [form.fields, values, errors],
  );

  return { fields, ...formParams };
}
