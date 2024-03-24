import type { ErrorsSchemaPayload } from '../types';
import type { FormApi } from './types';
import { EventCallable } from 'effector';
import { BatchInfo } from './map-schema';

export function setFormPartialErrors(
  errors: ErrorsSchemaPayload,
  formApi: FormApi,
  startBatch: EventCallable<BatchInfo>,
  mode: 'inner' | 'outer',
) {
  startBatch({ fields: Object.keys(errors), type: 'errors' });

  for (const apiKey in errors) {
    const fieldApi = formApi[apiKey];

    if (!fieldApi) {
      console.error(`Unknown field with path: ${apiKey}`);
      continue;
    }

    switch (mode) {
      case 'inner': {
        fieldApi.setInnerError(errors[apiKey]);
        break;
      }
      case 'outer': {
        fieldApi.setOuterError(errors[apiKey]);
        break;
      }
    }
  }
}
