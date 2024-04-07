import { spread } from 'patronum';
import {
  createEvent,
  createStore,
  sample,
  Event,
  EventAsReturnType,
} from 'effector';
import { clearUnits } from '../clear-units';

// from effector/patronum :D
type Tuple<T = unknown> = [T] | T[];
type Events<Result> = {
  [Key in keyof Result]: Event<Result[Key]>;
};

export function combineEventsInOrder<P extends Tuple>(
  events: Events<P>,
): { target: EventAsReturnType<P>; clear: () => void } {
  const $payloads = createStore<P>([] as unknown as P);
  const $lastTriggeredEventIndex = createStore(-1);

  const reset = createEvent();
  const target = createEvent<P>();

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    sample({
      clock: event,
      source: [$lastTriggeredEventIndex, $payloads] as const,
      filter: ([lastIndex]) => i - lastIndex === 1,
      fn: ([lastIndex, payloads], eventPayload) => ({
        lastIndex: lastIndex + 1,
        payloads: [...payloads, eventPayload] as unknown as P,
      }),
      target: spread({
        lastIndex: $lastTriggeredEventIndex,
        payloads: $payloads,
      }),
    });
  }

  sample({
    clock: $lastTriggeredEventIndex,
    source: [$lastTriggeredEventIndex, $payloads],
    filter: ([index]) => index === events.length - 1,
    fn: ([, payloads]) => payloads as unknown as P,
    target,
  });

  sample({
    clock: target,
    target: reset,
  });

  sample({
    clock: reset,
    fn: () => ({
      lastIndex: -1,
      payloads: [] as unknown as P,
    }),
    target: spread({
      lastIndex: $lastTriggeredEventIndex,
      payloads: $payloads,
    }),
  });

  return {
    target,
    clear: () =>
      clearUnits([reset, target, $lastTriggeredEventIndex, $payloads]),
  };
}
