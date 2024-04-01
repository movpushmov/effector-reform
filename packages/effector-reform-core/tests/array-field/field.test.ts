import { describe, expect, test } from '@jest/globals';
import { createArrayField } from '../../lib';
import { allSettled, fork } from 'effector';

describe('Array field tests', () => {
  test('push', async () => {
    const scope = fork();
    const field = createArrayField<number>([0]);

    await allSettled(field.push, { scope, params: 1 });

    expect(scope.getState(field.$values)).toStrictEqual([0, 1]);
  });

  test('swap', async () => {
    const scope = fork();
    const field = createArrayField<number>([0, 1]);

    await allSettled(field.swap, { scope, params: { indexA: 0, indexB: 1 } });

    expect(scope.getState(field.$values)).toStrictEqual([1, 0]);
  });

  test('move', async () => {
    const scope = fork();
    const field = createArrayField<number>([0, 1, 2, 3]);

    await allSettled(field.move, { scope, params: { from: 1, to: 4 } });

    expect(scope.getState(field.$values)).toStrictEqual([0, 2, 3, 1]);
  });

  test('insert', async () => {
    const scope = fork();
    const field = createArrayField<number>([0, 1, 2, 3]);

    await allSettled(field.insert, { scope, params: { value: 10, index: 2 } });

    expect(scope.getState(field.$values)).toStrictEqual([0, 1, 10, 2, 3]);
  });

  test('unshift', async () => {
    const scope = fork();
    const field = createArrayField<number>([0, 1, 2, 3]);

    await allSettled(field.unshift, { scope, params: 10 });

    expect(scope.getState(field.$values)).toStrictEqual([10, 0, 1, 2, 3]);
  });

  test('remove', async () => {
    const scope = fork();
    const field = createArrayField<number>([0, 1, 2, 3]);

    await allSettled(field.remove, { scope, params: { index: 2 } });

    expect(scope.getState(field.$values)).toStrictEqual([0, 1, 3]);
  });

  test('pop', async () => {
    const scope = fork();
    const field = createArrayField<number>([0, 1, 2, 3]);

    await allSettled(field.pop, { scope });

    expect(scope.getState(field.$values)).toStrictEqual([0, 1, 2]);
  });

  test('replace', async () => {
    const scope = fork();
    const field = createArrayField<number>([0, 1, 2, 3]);

    await allSettled(field.replace, { scope, params: { index: 2, value: 10 } });

    expect(scope.getState(field.$values)).toStrictEqual([0, 1, 10, 3]);
  });

  test('reset', async () => {
    const scope = fork();
    const field = createArrayField<number>([0]);

    await allSettled(field.push, { scope, params: 10 });
    await allSettled(field.push, { scope, params: 10 });
    await allSettled(field.push, { scope, params: 10 });
    await allSettled(field.push, { scope, params: 10 });
    await allSettled(field.push, { scope, params: 10 });
    await allSettled(field.push, { scope, params: 10 });

    await allSettled(field.reset, { scope });

    expect(scope.getState(field.$values)).toStrictEqual([0]);
  });

  test('change', async () => {
    const scope = fork();
    const field = createArrayField<number>([0, 1]);

    await allSettled(field.change, { scope, params: [500, 1000, 1500] });

    expect(scope.getState(field.$values)).toStrictEqual([500, 1000, 1500]);
  });

  test('changeError', async () => {
    const scope = fork();
    const field = createArrayField<number>([]);

    expect(scope.getState(field.$error)).toBe(null);

    await allSettled(field.changeError, { scope, params: 'Tessssst' });

    expect(scope.getState(field.$error)).toBe('Tessssst');
  });

  test('array field push & subfield change', async () => {
    const scope = fork();
    const field = createArrayField<{ a: string }>([]);

    await allSettled(field.push, { scope, params: { a: '' } });
    await allSettled(field.push, { scope, params: { a: '' } });
    await allSettled(field.push, { scope, params: { a: '' } });

    const secondField = scope.getState(field.$values)[1];

    await allSettled(secondField.a.change, { scope, params: '123' });

    expect(scope.getState(secondField.a.$value)).toBe('123');
  });
});
