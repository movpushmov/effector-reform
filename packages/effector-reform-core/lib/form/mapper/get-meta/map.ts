import {
  arrayFieldSymbol,
  primaryFieldSymbol,
  ReadyFieldsGroupSchema,
} from '../../../fields';
import { Node } from '../types';
import { setupArrayField } from './setup-array-field';
import { setupPrimaryField } from './setup-primary-field';
import { This } from './types';

export function map(
  this: This,
  currentNode: ReadyFieldsGroupSchema,
  resultValuesNode: Node,
  resultErrorsNode: Node,
  path: string[] = [],
) {
  for (const key in currentNode) {
    const subNode = currentNode[key];

    switch (subNode.type) {
      case primaryFieldSymbol: {
        setupPrimaryField.call(this, {
          field: subNode,
          resultValuesNode,
          resultErrorsNode,
          key,
          path,
        });

        break;
      }
      case arrayFieldSymbol: {
        setupArrayField.call(this, {
          field: subNode,
          resultValuesNode,
          resultErrorsNode,
          key,
          path,
          map,
        });

        break;
      }
      default: {
        resultValuesNode[key] = {};
        resultErrorsNode[key] = {};

        map.call(
          this,
          subNode as ReadyFieldsGroupSchema,
          resultValuesNode[key],
          resultErrorsNode[key],
          [...path, key],
        );

        break;
      }
    }
  }
}
