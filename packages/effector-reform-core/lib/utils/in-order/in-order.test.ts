import { test, expect, vi } from 'vitest';

import { allSettled, createEffect, createEvent, fork, sample } from 'effector';
import { inOrder } from './in-order';

test('in order test', async () => {
  const scope = fork();

  const firstEvent = createEvent<number>();
  const secondEvent = createEvent<number>();
  const thirdEvent = createEvent<number>();

  const mockedFn = vi.fn();
  const fx = createEffect(mockedFn);

  const clock = inOrder([firstEvent, secondEvent, thirdEvent]);

  sample({
    clock,
    target: fx,
  });

  allSettled(thirdEvent, { scope, params: 10 }); // empty
  allSettled(secondEvent, { scope, params: 20 }); // empty
  allSettled(thirdEvent, { scope, params: 30 }); // empty

  allSettled(firstEvent, { scope, params: 10 }); // empty
  allSettled(thirdEvent, { scope, params: 20 }); // empty

  allSettled(firstEvent, { scope, params: 1 }); // empty
  allSettled(secondEvent, { scope, params: 2 }); // empty
  allSettled(thirdEvent, { scope, params: 3 }); // fx -> [1, 2, 3]

  await allSettled(scope);

  expect(mockedFn).toBeCalledTimes(1);
  expect(mockedFn).toBeCalledWith([1, 2, 3]);
});
