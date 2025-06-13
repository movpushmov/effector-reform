

export interface PrimitiveFieldSchema<Value, Meta> {
  
}

export type PrimitiveField<Value, Meta> = {
  id: string;

  value: Value;
  meta: Meta;

  error: FieldError;
  isValid: boolean;
  isFocused: boolean;
};

export type DynamicShape = {
  id: string;
  
  primitives: PrimitiveField<any, any>[];
  shapes: DynamicShape[];
};