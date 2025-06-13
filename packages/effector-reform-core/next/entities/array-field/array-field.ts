function createField() {}

function createSchema<Value, Meta extends object>(
  options: CreateOptions<Value, Meta>,
): PrimitiveFieldSchema<Value, Meta> {
  return { meta: {} as Meta, error: null, ...options };
}

export const arrayField = {
  create: createField,
  schema: createSchema,
};
