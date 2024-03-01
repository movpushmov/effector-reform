---
id: primary-field
sidebar_position: 2
title: PrimaryField
tags:
  - Core
  - Types
---

### API Reference

```ts
export interface PrimaryFieldApi<T extends PrimaryValue> {
  change: EventCallable<T>; // 
  changed: Event<T>;

  reset: EventCallable<void>;

  changeError: EventCallable<FieldError>;
  errorChanged: Event<FieldError>;
}
```

```ts
export interface PrimaryField<T extends PrimaryValue = any> extends PrimaryFieldApi<T> {
  type: PrimaryFieldSymbolType;

  $value: Store<T>;
  $error: Store<FieldError>;

  $isDirty: Store<boolean>;
  $isValid: Store<boolean>;

  forkOnCreateForm: boolean;

  fork: (options?: CreatePrimaryFieldOptions) => PrimaryField<T>;

  '@@unitShape': () => {
    value: Store<T>;
    error: Store<FieldError>;

    isDirty: Store<boolean>;
    isValid: Store<boolean>;

    reset: EventCallable<void>;

    change: EventCallable<T>;
    changeError: EventCallable<FieldError>;
  };
}
```