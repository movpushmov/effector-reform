import { keyval, KeyvalWithState } from '@effector/model';
import { createStore } from 'effector';
import { DynamicShape } from './types';

export const primitiveFields = keyval(() => {
  const $id = createStore('');
  const $value = createStore<any>(null);
  const $meta = createStore<any>(null);

  return {
    key: 'id',

    state: {
      id: $id,
      value: $value,
      meta: $meta,
    },
  };
});

export const constants = keyval(() => {
  const $id = createStore('');
  const $value = createStore<any>(null);

  return {
    key: 'id',
    state: {
      id: $id,
      value: $value,
    }
  }
})

export const dynamicShapes = keyval(() => {
  const $type = createStore<string>('');
  const $id = createStore('');

  const childConstants = keyval(constants);
  const childPrimitives = keyval(primitiveFields);
  const childShapes = keyval(dynamicShapes) as KeyvalWithState<DynamicShape, DynamicShape>;

  return {
    key: 'id',
    state: {
      id: $id,
      type: $type,
      
      constants: childConstants,
      primitives: childPrimitives,
      shapes: childShapes,
    },
  };
});