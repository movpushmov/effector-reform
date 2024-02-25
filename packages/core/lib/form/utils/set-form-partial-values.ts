import { isPrimaryValue } from '../../fields';
import type { FormApi, Node } from './types';

export function setFormPartialValues<Values>(values: Values, formApi: FormApi) {
  function iterate(node: Node, path: string[] = []) {
    for (const key in node) {
      const subNode = node[key];
      const apiKey = [...path, key].join('.');

      if (isPrimaryValue(subNode) || Array.isArray(subNode)) {
        const fieldApi = formApi[apiKey];

        if (!fieldApi) {
          console.error(`Unknown field with path: ${apiKey}`);
          continue;
        }

        fieldApi.setValue(subNode);
        continue;
      }

      if (typeof subNode === 'object') {
        iterate(subNode, [...path, key]);
      }
    }
  }

  iterate(values);
}
