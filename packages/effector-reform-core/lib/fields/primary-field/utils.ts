import { primaryFieldSymbol } from './symbol';
import { PrimaryField, PrimaryJsonValue, PrimaryValue } from './types';

export function isPrimaryField(props: any): props is PrimaryField {
  return 'type' in props && props.type === primaryFieldSymbol;
}

export function isPrimaryJsonValue(props: any): props is PrimaryJsonValue {
  return (
    typeof props === 'boolean' ||
    typeof props === 'string' ||
    typeof props === 'number'
  );
}

export function isPrimaryValue(props: any): props is PrimaryValue {
  const isFile = typeof File !== 'undefined' ? props instanceof File : false;

  const isBuffer =
    typeof Buffer !== 'undefined' ? props instanceof Buffer : false;
  const isFileList =
    typeof FileList !== 'undefined' ? props instanceof FileList : false;

  return (
    isPrimaryJsonValue(props) ||
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
