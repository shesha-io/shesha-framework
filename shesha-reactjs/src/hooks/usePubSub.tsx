import { useEffect, useState } from 'react';

/**
 * Pub sub state
 */
export interface IPubSubState {
  /**
   * Unique state id
   */
  readonly id: string;

  /**
   * The state to be published
   */
  readonly state?: any;
}

/**
 *
 */
export interface IPubSubPayload<T = any> {
  /**
   * Unique state id
   */
  readonly stateId: string;

  /**
   * Subscribed data
   */
  readonly state?: T;

  readonly doneEvent?: {
    name: string;
    stateId: string;
    data: any;
  };
}

/**
 * PubSub object
 */
interface ISubscription<T> {
  /**
   * Subscribes to an event
   *
   * @param token - event name
   * @param eventHandler - event handler
   */
  subscribe(token: string, eventHandler: (data: T) => void): void;

  /**
   * A function for unsubscribing to events to events
   */
  unsubscribe: (token: string) => void;

  /**
   * A function for publishing events
   * @param token - event name
   * @param data - data to publish
   */
  publish(token: string, data?: T): void;

  /**
   * Clears all event listeners for this instance
   */
  clearAllEventListeners(): void;
}

/**
 * A hook that can be used to deal with custom events in react applications that works similar to pub sub pattern
 *
 * @returns {object} instance of subscription
 */
export const usePubSub = (): ISubscription<IPubSubPayload> => {
  const subscribe = (token: string, eventHandler: (data: IPubSubPayload) => void) => {
    const handleEvent = (event: CustomEvent | Event) => {
      const data = (event as CustomEvent).detail;
      eventHandler(data);
    };

    window.addEventListener(token, handleEvent, false);
  };

  const unsubscribe = (token: string) => removeEventListener(token, () => {}, false);

  const publish = (token: string, data?: IPubSubPayload) =>
    dispatchEvent(new CustomEvent(token, { detail: data || {} }));

  const clearAllEventListeners = () => {
    // events.forEach(localEvent => {
    //   removeEventListener(localEvent, () => {}, false);
    // });
    // setEvents([]);
  };

  return { subscribe, unsubscribe, publish, clearAllEventListeners };
};

/**
 * Subscribes to an event
 *
 * @param eventName event name
 * @param eventHandler handler for the event
 */
export function useSubscribe<T extends IPubSubPayload>(
  eventName: string | string[],
  eventHandler: (data: T) => void
): void {
  // it's important to use the same event listener to be able to unsubscribe correctly
  const eventListener = e => eventHandler((e as any).detail);
  useEffect(() => {
    if (typeof eventName === 'string') {
      window.addEventListener(eventName, eventListener);
    } else if (Array.isArray(eventName)) {
      eventName.forEach(name => {
        if (name) {
          window.addEventListener(name, eventListener);
        }
      });
    }

    return () => {
      if (typeof eventName === 'string') {
        window.removeEventListener(eventName, eventListener, false);
      } else if (Array.isArray(eventName)) {
        eventName.forEach(name => {
          if (name) {
            window.removeEventListener(name, eventListener, false);
          }
        });
      }
    };
  });
}

/**
 * Subscribes to an event and return the value
 *
 * @param eventName event name
 * @param deps if present, effect will only activate if the values in the list change.
 * @returns a value you're subscribed
 */
export function useSubscribedValue<T extends IPubSubPayload>(
  eventName: string,
  deps?: ReadonlyArray<any>
): T | undefined {
  const [state, setState] = useState<T>();

  useEffect(() => {
    window.addEventListener(eventName, (e: any) => {
      const newState = (e as unknown) as any;

      setState(newState?.detail as T);
    });

    return () => {
      window.removeEventListener(eventName, () => {}, false);
    };
  }, [eventName, deps]);

  return state;
}

/**
 * Used to publish an event attached to the window
 *
 * @param eventName event name
 * @param computer a function that that returns the value to pe published
 * @param deps if present, effect will only activate if the values in the list change.
 */
export function usePublish<T extends IPubSubPayload>(
  eventName: string,
  computer: () => T,
  deps?: ReadonlyArray<any>
): void {
  useEffect(() => {
    dispatchEvent(
      new CustomEvent<T>(eventName, { detail: computer() })
    );
  }, deps);
}
