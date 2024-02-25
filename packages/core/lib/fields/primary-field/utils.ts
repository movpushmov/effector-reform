import { primaryFieldSymbol } from './symbol';
import { PrimaryField, PrimaryValue } from './types';

export function isPrimaryField(props: any): props is PrimaryField {
  return 'type' in props && props.type === primaryFieldSymbol;
}

export function isPrimaryValue(props: any): props is PrimaryValue {
  const isBuffer =
    typeof Buffer !== 'undefined' ? props instanceof Buffer : false;

  return (
    typeof props === 'boolean' ||
    typeof props === 'string' ||
    typeof props === 'number' ||
    typeof props === 'bigint' ||
    isBuffer ||
    props instanceof Date ||
    props instanceof Blob ||
    props instanceof ArrayBuffer ||
    props instanceof Int8Array ||
    props instanceof Int16Array ||
    props instanceof Int32Array ||
    props instanceof BigInt64Array ||
    props instanceof File ||
    props instanceof FileList
  );
}
