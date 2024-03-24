import { StoreValue } from 'effector';
import { ArrayField } from '../array-field';
import { PrimaryField, PrimaryValue } from '../primary-field';

type ReadyFieldsSchemaFieldType =
  | PrimaryField
  | ArrayField<any>
  | ReadyFieldsGroupSchema;

type RawFieldsSchemaFieldType =
  | PrimaryValue
  | RawFieldsSchemaFieldType[]
  | RawFieldsGroupSchema
  | ReadyFieldsSchemaFieldType;

export type RawFieldsGroupSchema = {
  [k in string]: RawFieldsSchemaFieldType;
};

export type ReadyFieldsGroupSchema = {
  [k in string]: PrimaryField | ArrayField<any> | ReadyFieldsGroupSchema;
};

export type AnySchema = RawFieldsGroupSchema | ReadyFieldsGroupSchema;

export type UserFormSchema<T extends AnySchema | PrimaryValue> =
  T extends PrimaryValue
    ? T
    : {
        [K in keyof T]: T[K] extends PrimaryValue
          ? PrimaryField<T[K]>
          : T[K] extends Array<any>
            ? ArrayField<T[K][number]>
            : T[K] extends PrimaryField<any>
              ? T[K]
              : T[K] extends ArrayField<any>
                ? ArrayField<
                    T[K] extends ArrayField<infer K, any> ? K : never,
                    UserFormSchema<StoreValue<T[K]['$values']>[number]>
                  >
                : T[K] extends AnySchema
                  ? UserFormSchema<T[K]>
                  : ReadyFieldsGroupSchema;
      };
