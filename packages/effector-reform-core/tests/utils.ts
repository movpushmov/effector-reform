import { createEffect, sample, Unit } from 'effector';
import { vi } from 'vitest';

export function watchCalls(unit: Unit<any>) {
  const mockedFn = vi.fn();
  const fx = createEffect(mockedFn);

  sample({
    clock: unit,
    target: fx,
  });

  return mockedFn;
}
