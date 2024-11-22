import { primitiveFieldSymbol } from './symbol';
import { PrimitiveField, PrimitiveJsonValue, PrimitiveValue } from './types';
import { InnerFieldApi } from '../types';
import { clearUnits } from '../../utils';

export function isPrimitiveField(props: any): props is PrimitiveField {
  return '@@type' in props && props['@@type'] === primitiveFieldSymbol;
}

export function isPrimitiveJsonValue(props: any): props is PrimitiveJsonValue {
  return (
    typeof props === 'boolean' ||
    typeof props === 'string' ||
    typeof props === 'number' ||
    props === null
  );
}

export function isPrimitiveValue(props: any): props is PrimitiveValue {
  const isFile = typeof File !== 'undefined' ? props instanceof File : false;

  const isBuffer =
    typeof Buffer !== 'undefined' ? props instanceof Buffer : false;
  const isFileList =
    typeof FileList !== 'undefined' ? props instanceof FileList : false;

  return (
    isPrimitiveJsonValue(props) ||
    typeof props === 'bigint' ||
    isBuffer ||
    isFile ||
    isFileList ||
    props instanceof Date ||
    props instanceof Blob ||
    props instanceof ArrayBuffer ||
    props instanceof Int8Array ||
    props instanceof Int16Array ||
    props instanceof Int32Array ||
    props instanceof BigInt64Array
  );
}

export function clearPrimitiveFieldMemory(field: PrimitiveField, deep = false) {
  const innerApi = field as PrimitiveField & InnerFieldApi;

  clearUnits(
    [
      field.$value,
      field.$error,
      field.$meta,
      field.change,
      field.changeError,
      field.errorChanged,
      field.changed,
      field.reset,
      field.resetCompleted,
      field.metaChanged,
      innerApi.$outerError,
      innerApi.$innerError,
      innerApi.setInnerError,
      innerApi.batchedSetValue,
      innerApi.batchedSetOuterError,
      innerApi.batchedSetInnerError,
      innerApi.batchedReset,
    ],
    deep,
  );
}
