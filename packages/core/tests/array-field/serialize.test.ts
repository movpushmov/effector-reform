import { describe, test, expect } from '@jest/globals';
import { createArrayField } from '../../lib';
import { allSettled, fork, serialize } from 'effector';
import { mapSchema } from '../../lib/form/utils';

describe('Array field ssr api', () => {
  test('check array field values serialization & deserialization', async () => {
    const field = createArrayField([]);

    let values: any;

    {
      const scope = fork();

      await allSettled(field.change, { scope, params: [{ a: 5, b: 10 }] });
      values = serialize(scope);

      expect(values).toMatchObject({
        '2n8fgy|eci76e': [
          { values: { a: 5, b: 10 }, errors: { a: null, b: null } },
        ],
        '2n8fgy|-c9edul': true,
      });
    }

    {
      const scope = fork({ values });
      const mappedValues = scope
        .getState(field.$values)
        .map((item) => scope.getState(mapSchema(item).$values));

      expect(mappedValues).toMatchObject([{ a: 5, b: 10 }]);
    }
  });
});
