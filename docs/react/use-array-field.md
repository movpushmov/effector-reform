# useArrayField

Use array field model in react component

__Type Signature:__

```ts
function useArrayField<
  T extends ArrayField<any>,
  Value extends ArrayFieldItemType = T extends ArrayField<any, any, infer D>
    ? D
    : never,
  Meta extends object = T extends ArrayField<any, infer D> ? D : any,
>(field: T): ReactArrayFieldApi<Value, Meta>;
```

__Example Usage:__

::: tip
You can use `useArrayField` with field of form for optimization like this:

```ts
const form = createForm({ schema: { friends: [] } });

// in react component
const { values, onChange } = useArrayField(form.fields.friends);
```
:::

```tsx
import { createArrayField, createField } from "@effector-reform/core";
import { useArrayField, useField } from "@effector-reform/react";
import { useCallback } from "react";

const newIncomeField = createField(0);
const incomesField = createArrayField<number>([]);

const Field = () => {
  const newIncome = useField(newIncomeField);
  const incomes = useArrayField(incomesField);

  const addIncome = useCallback(() => {
    incomes.push(newIncome.value);
    newIncome.reset();
  }, [newIncome.value, incomes.push]);

  return (
    <>
      <p>My budget</p>

      <div>
        {incomes.values.map(income => <span>${income}</span>)}
      </div>

      <p>add income</p>

      <input
        type="number"
        value={newIncome.value}
        onChange={(event) => newIncome.onChange(parseInt(event.currentTarget.value))}
      />

      <button onClick={addIncome}>
        add
      </button>
    </>
  )
}
```

## API

| name          | type                                                        | description                                             |
|---------------|-------------------------------------------------------------|---------------------------------------------------------|
| values        | `(T extends ReadyFieldsGroupSchema ? ReactFields<T> : T)[]` | array field values                                      |
| meta          | `Meta`                                                      | array field meta                                        |
| error         | `FieldError`                                                | array field error                                       |
| isValid       | `boolean`                                                   | is array field valid                                    |
| isDirty       | `boolean`                                                   | is array field changed                                  |
| onReset       | `() => void`                                                | reset array field values                                |
| onChange      | `(values: Payload[]) => void`                               | change array field values                               |
| onChangeError | `(error: FieldError) => void`                               | change array field outer error                          |
| onChangeMeta  | `(meta: Meta) => void`                                      | change field meta                                       |
| onPush        | `(payload: PushPayload<Payload>) => void`                   | push item [reference](../core/create-array-field)       |
| onSwap        | `(payload: SwapPayload) => void`                            | swap items [reference](../core/create-array-field)      |
| onMove        | `(payload: MovePayload) => void`                            | move item [reference](../core/create-array-field)       |
| onInsert      | `(payload: InsertOrReplacePayload<Payload>) => void`        | insert item [reference](../core/create-array-field)     |
| onUnshift     | `(payload: UnshiftPayload<Payload>) => void`                | unshift item(s) [reference](../core/create-array-field) |
| onRemove      | `(payload: RemovePayload) => void`                          | remove item [reference](../core/create-array-field)     |
| onPop         | `(payload: void) => void`                                   | pop item [reference](../core/create-array-field)        |
| onReplace     | `(payload: InsertOrReplacePayload<Payload>) => void`        | replace item [reference](../core/create-array-field)    |
