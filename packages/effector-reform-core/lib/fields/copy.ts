import { ArrayField, arrayFieldSymbol, createArrayField } from './array-field';
import {
  createField,
  PrimitiveField,
  primitiveFieldSymbol,
} from './primitive-field';

export function copy<T extends PrimitiveField>(field: T): T;
export function copy<T extends ArrayField<any>>(field: T): T;
export function copy<T extends PrimitiveField | ArrayField<any>>(field: T): T {
  switch (field.type) {
    case arrayFieldSymbol: {
      return createArrayField(field.$values.getState(), {
        error: field.$error.getState(),
        meta: field.$meta.getState(),
        copyOnCreateForm: field.copyOnCreateForm,
      }) as unknown as T;
    }
    case primitiveFieldSymbol: {
      return createField(field.$value.getState(), {
        error: field.$error.getState(),
        meta: field.$meta.getState(),
        copyOnCreateForm: field.copyOnCreateForm,
      }) as unknown as T;
    }
  }
}
