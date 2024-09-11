# createField

Creates field, which contains primitive value
(like `string`, `number`, `boolean`, `Date`, `bigint`, `Blob`, `ArrayBuffer`, `File`, `FileList`, `null`)

__Type Signature:__

```ts
interface CreatePrimitiveFieldOptions<Meta extends object = any> {
  error?: FieldError;
  meta?: Meta;
  copyOnCreateForm?: boolean;
}

function createField<
  T extends PrimitiveValue,
  Meta extends object = any,
>(
  defaultValue: T,
  overrides?: CreatePrimitiveFieldOptions<Meta>,
): PrimitiveField<T, Meta>;
```

__Example Usage:__

```ts
import { createField } from "@effector-reform/core";
import { sample, createEffect } from "effector";

const numberField = createField(0);
const stringField = createField('');
const typedStringField = createField<'inner' | 'outer'>('inner');

const logFx = createEffect(console.log);

sample({
  clock: [numberField.changed, stringField.changed],
  target: logFx,
});

numberField.change(10); // logFx -> 10
stringField.change('test'); // logFx -> 'test'
```

*base primitive field example*

```ts
import { createField } from "@effector-reform/core";
import { createEvent, sample } from "effector";

const field = createField<number, { onlyPositive: boolean }>(0, {
  meta: { onlyPositive: false }
});

const ruleToggled = createEvent();

sample({
  clock: ruleToggled,
  source: field.$meta,
  fn: (meta) => { onlyPositive: !meta.onlyPositive },
  target: field.changeMeta,
});

field.$meta.getState(); // { onlyPositive: false } 

ruleToggled();

field.$meta.getState(); // { onlyPositive: true } 
```

*primitive field meta example*

### API

| name         | type                          | description                                                                   |
| ------------ | ----------------------------- | ----------------------------------------------------------------------------- |
| $value       | `Store<T>`                  | value of field                                                                |
| $meta        | `Store<Meta>`               | field meta                                                                    |
| $error       | `Store<FieldError>`         | error of field                                                                |
| $isValid     | `Store<boolean>`            | is field valid                                                                |
| $isFocused   | `Store<boolean>`            | is user focused on field                                                      |
| blurred      | `Event<void>`               | triggered when user blurred input (you must set focus/blur handlers in input) |
| focused      | `Event<void>`               | triggered when user focused input (you must set focus/blur handlers in input) |
| change       | `EventCallable<T>`          | change field value                                                            |
| changed      | `Event<T>`                  | triggered when field value changed                                            |
| reset        | `EventCallable<void>`       | reset field value                                                             |
| changeError  | `EventCallable<FieldError>` | change outer field error                                                      |
| changeMeta   | `EventCallable<Meta>`       | change field meta                                                             |
| metaChanged  | `Event<Meta>`               | field meta changed                                                            |
| errorChanged | `Event<FieldError>`         | triggered when error changed (inner or outer)                                 |
