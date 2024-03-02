import type { PartialRecursive, ReadyFieldsGroupSchema } from '../../fields';
import type { FormErrors } from '../types';
import type { FormApi, Node } from './types';

export function setFormPartialErrors<
  T extends PartialRecursive<FormErrors<ReadyFieldsGroupSchema>>,
>(errors: T, formApi: FormApi, mode: 'inner' | 'outer') {
  function iterate(node: Node, path: string[] = []) {
    for (const key in node) {
      const subNode = node[key];
      const apiKey = [...path, key].join('.');

      if (typeof subNode === 'string' || subNode === null) {
        const fieldApi = formApi[apiKey];

        if (!fieldApi) {
          console.error(`Unknown field with path: ${apiKey}`);
          continue;
        }

        switch (mode) {
          case 'inner': {
            fieldApi.setInnerError(subNode);
            break;
          }
          case 'outer': {
            fieldApi.setOuterError(subNode);
            break;
          }
        }
      }

      if (Array.isArray(subNode)) {
        subNode.map((item, index) =>
          iterate(item, [...path, key, index.toString()]),
        );
      }

      if (typeof subNode === 'object') {
        iterate(subNode, [...path, key]);
      }
    }
  }

  iterate(errors);
}
