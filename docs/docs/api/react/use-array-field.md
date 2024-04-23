---
id: use-array-field
sidebar_position: 2
title: useArrayField
tags:
  - React
  - Array field
---

Use array field model in react component

### Formulae

```ts
function useArrayField<T extends ArrayField<any>>(field: T);
```

### Examples

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

### API Reference

| name        | type                                                        | description                                             |
|-------------|-------------------------------------------------------------|---------------------------------------------------------|
| values      | `(T extends ReadyFieldsGroupSchema ? ReactFields<T> : T)[]` | array field values                                      |
| error       | `FieldError`                                                | array field error                                       |
| isValid     | `boolean`                                                   | is array field valid                                    |
| isDirty     | `boolean`                                                   | is array field changed                                  |
| reset       | `() => void`                                                | reset array field values                                |
| change      | `(values: Payload[]) => void`                               | change array field values                               |
| changeError | `(error: FieldError) => void`                               | change array field outer error                          |
| push        | `(payload: PushPayload<Payload>) => void`                   | push item [reference](../core/create-array-field)       |
| swap        | `(payload: SwapPayload) => void`                            | swap items [reference](../core/create-array-field)      |
| move        | `(payload: MovePayload) => void`                            | move item [reference](../core/create-array-field)       |
| insert      | `(payload: InsertOrReplacePayload<Payload>) => void`        | insert item [reference](../core/create-array-field)     |
| unshift     | `(payload: UnshiftPayload<Payload>) => void`                | unshift item(s) [reference](../core/create-array-field) |
| remove      | `(payload: RemovePayload) => void`                          | remove item [reference](../core/create-array-field)     |
| pop         | `(payload: void) => void`                                   | pop item [reference](../core/create-array-field)        |
| replace     | `(payload: InsertOrReplacePayload<Payload>) => void`        | replace item [reference](../core/create-array-field)    |