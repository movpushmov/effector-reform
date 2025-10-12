import {
  type ZodType as ZodTypeV3,
  type ZodError as ZodErrorV3,
} from 'zod/v3';
import {
  type $ZodType as ZodTypeV4,
  type $ZodError as ZodErrorV4,
} from 'zod/v4/core';

type ZodAnyType = ZodTypeV3 | ZodTypeV4;
type ZodAnyError = ZodErrorV3 | ZodErrorV4;

function isZodV4Schema(schema: unknown): schema is ZodTypeV4 {
  return !!schema && typeof schema === 'object' && '_zod' in schema;
}

export { isZodV4Schema, ZodAnyType, ZodAnyError };
