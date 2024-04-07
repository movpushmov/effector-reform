import { expect, test } from '@jest/globals';
import { fn } from 'jest-mock';
import { allSettled, createEffect, createEvent, fork, sample } from 'effector';
import { combineEventsInOrder } from './combine-events-in-order';

test('combine events in order', async () => {
  const scope = fork();
  const ev1 = createEvent<number>();
  const ev2 = createEvent<number>();

  const mockedFn = fn();
  const logFx = createEffect(mockedFn);

  sample({
    clock: combineEventsInOrder([ev2, ev1]).target,
    target: logFx,
  });

  await allSettled(ev1, { scope, params: 1 });
  await allSettled(ev1, { scope, params: 2 });
  await allSettled(ev2, { scope, params: 3 });
  await allSettled(ev1, { scope, params: 4 });
  await allSettled(ev2, { scope, params: 5 });

  expect(mockedFn).toBeCalledWith([3, 4]);
});
