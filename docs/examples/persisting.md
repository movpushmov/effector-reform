# Persist forms

You can easily persist form with `effector-storage` library. For this just use `form.persist` and `form.$persistInfo`:

```ts
import { appStarted } from 'path/to/app/started';
import { combineEvents } from 'patronum';
import { createForm } from '@effector-reform/core';
import { persist } from 'effector-storage/local'; // you can use any adapter you want

const form = createForm({
  schema: {
    name: '',
    age: 0,
  },
});

persist({
  key: 'someForm',
  clock: combineEvents({ events: [form.changed, form.errorsChanged] }),
  pickup: appStarted,
  source: form.$persistInfo,
  target: form.persist,
});
```
