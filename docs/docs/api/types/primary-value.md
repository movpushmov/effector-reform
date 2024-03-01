---
id: primary-value
sidebar_position: 1
title: PrimaryValue
tags:
  - Core
  - Types
---

can be used in primary field or array field

```ts
export type PrimaryJsonValue = string | number | boolean | Date;

export type PrimaryValue =
  | bigint
  | PrimaryJsonValue
  | Blob
  | Buffer
  | ArrayBuffer
  | Int8Array
  | Int16Array
  | Int32Array
  | BigInt64Array
  | File
  | FileList;
```