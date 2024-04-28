import {
  createEvent,
  createStore,
  Event,
  EventAsReturnType,
  EventCallable,
  sample,
} from 'effector';
import { spread } from 'patronum';

type Events<Result> = {
  [Key in keyof Result]: Event<Result[Key]>;
};

export function inOrder<P extends any[]>(
  events: Events<P>,
): EventAsReturnType<P> {
  const emptyArray = [] as unknown as P;

  const $lastIndex = createStore(-1);
  const $payloads = createStore<P>([...emptyArray] as P);

  const reset = createEvent();
  const target = createEvent<P>();

  const typedEvents = events as EventCallable<any>[];

  sample({
    clock: target,
    target: reset,
  });

  sample({
    clock: reset,
    fn: () => ({ lastIndex: -1, payloads: [...emptyArray] as P }),
    target: spread({
      lastIndex: $lastIndex,
      payloads: $payloads,
    }),
  });

  for (let i = 0; i < typedEvents.length; i++) {
    const event = typedEvents[i];

    sample({
      clock: event,
      source: $lastIndex,
      filter: (lastIndex) => i - lastIndex !== 1,
      target: reset,
    });

    if (i === typedEvents.length - 1) {
      sample({
        clock: event,
        source: [$lastIndex, $payloads] as const,
        filter: ([lastIndex]) => i - lastIndex === 1,
        fn: ([, payloads], payload) => [...payloads, payload] as P,
        target,
      });
    } else {
      sample({
        clock: event,
        source: [$lastIndex, $payloads] as const,
        filter: ([lastIndex]) => i - lastIndex === 1,
        fn: ([, payloads], payload) => ({
          lastIndex: i,
          payloads: [...payloads, payload] as P,
        }),
        target: spread({
          lastIndex: $lastIndex,
          payloads: $payloads,
        }),
      });
    }
  }

  return target;
}
