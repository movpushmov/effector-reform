import {
  arrayFieldSymbol,
  isPrimitiveValue,
  primitiveFieldSymbol,
  ReadyFieldsGroupSchema,
} from '@effector-reform/core';
import { Scope, scopeBind, EventCallable, Store } from 'effector';
import {
  ReactArrayFieldApi,
  ReactFields,
  ReactPrimitiveFieldApi,
} from '../types';

export function getFields<T extends ReadyFieldsGroupSchema>(
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
            isPrimitiveValue(item) ? item : getFields(item, scope),
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
        } as ReactArrayFieldApi<any>;

        break;
      }
      case primitiveFieldSymbol: {
        const change = bindEvent(field.change);
        const focus = bindEvent(field.focus);
        const blur = bindEvent(field.blur);

        node[fieldName] = {
          value: getStoreValue(field.$value),
          error: getStoreValue(field.$error),
          isDirty: getStoreValue(field.$isDirty),
          isValid: getStoreValue(field.$isValid),
          onChangeError: bindEvent(field.changeError),
          onChange: (newValue) => change(newValue),
          onFocus: () => focus(),
          onBlur: () => blur(),
        } as ReactPrimitiveFieldApi<any>;

        break;
      }
      default: {
        node[fieldName] = getFields(
          fields[fieldName] as ReadyFieldsGroupSchema,
          scope,
        );
      }
    }
  }

  return node;
}
