import { isPrimaryValue } from '../../fields';
import type { FormApi, Node } from './types';
import { EventCallable } from 'effector';
import { BatchInfo } from './map-schema';

export function setFormPartialValues<Values>(
  values: Values,
  formApi: FormApi,
  startBatch: EventCallable<BatchInfo>,
) {
  const iteratedValues: Record<
    string,
    { event: (value: any) => void; value: any }
  > = {};

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

        iteratedValues[apiKey] = {
          event: fieldApi.setValue,
          value: subNode,
        };
        continue;
      }

      if (typeof subNode === 'object') {
        iterate(subNode, [...path, key]);
      }
    }
  }

  iterate(values);

  startBatch({ fields: Object.keys(iteratedValues), type: 'values' });

  for (const apiKey in iteratedValues) {
    iteratedValues[apiKey].event(iteratedValues[apiKey].value);
  }
}
