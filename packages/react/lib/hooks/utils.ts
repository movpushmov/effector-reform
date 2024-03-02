import {
  FormFields,
  arrayFieldSymbol,
  isPrimaryValue,
  primaryFieldSymbol,
} from '@effector-reform/core';
import { Scope, scopeBind, EventCallable, Store } from 'effector';
import { ReactFields } from '../types';

export function getFields<T extends FormFields>(
  fields: T,
  scope: Scope | null,
): ReactFields<T> {
  const node: any = {};

  function getStoreValue<U>(store: Store<U>) {
    return scope ? scope.getState(store) : store.getState();
  }

  function bindEvent<U>(event: EventCallable<U>) {
    return scope ? scopeBind(event, { scope }) : event;
  }

  for (const fieldName in fields) {
    const field = fields[fieldName];

    switch (field.type) {
      case arrayFieldSymbol: {
        node[fieldName] = {
          values: getStoreValue(field.$values).map((item) =>
            isPrimaryValue(item) ? item : getFields(item, scope),
          ),
          isDirty: getStoreValue(field.$isDirty),
          isValid: getStoreValue(field.$isValid),
          error: getStoreValue(field.$error),
          change: bindEvent(field.change),
          changeError: bindEvent(field.changeError),
          reset: bindEvent(field.reset),
          push: bindEvent(field.push),
          swap: bindEvent(field.swap),
          move: bindEvent(field.move),
          insert: bindEvent(field.insert),
          unshift: bindEvent(field.unshift),
          remove: bindEvent(field.remove),
          pop: bindEvent(field.pop),
          replace: bindEvent(field.replace),
        };

        break;
      }
      case primaryFieldSymbol: {
        node[fieldName] = {
          value: getStoreValue(field.$value),
          error: getStoreValue(field.$error),
          isDirty: getStoreValue(field.$isDirty),
          isValid: getStoreValue(field.$isValid),
          change: bindEvent(field.change),
          changeError: bindEvent(field.changeError),
          focus: bindEvent(field.focus),
          blur: bindEvent(field.blur),
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
