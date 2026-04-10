
export type SubscriptionHandler<THandlerArgs> = (args: THandlerArgs) => void;

export type SubscribeFunc<TKey extends string, THandlerArgs> = (type: TKey, callback: SubscriptionHandler<THandlerArgs>) => void;

export class SubscriptionManager<TKey extends string, THandlerArgs> {
  private subscriptions: Map<TKey, Set<SubscriptionHandler<THandlerArgs>>>;

  constructor() {
    this.subscriptions = new Map<TKey, Set<SubscriptionHandler<THandlerArgs>>>();
  }

  private getSubscriptions = (type: TKey): Set<SubscriptionHandler<THandlerArgs>> => {
    const existing = this.subscriptions.get(type);
    if (existing)
      return existing;

    const subscriptions = new Set<SubscriptionHandler<THandlerArgs>>();
    this.subscriptions.set(type, subscriptions);
    return subscriptions;
  };

  subscribe(type: TKey, callback: SubscriptionHandler<THandlerArgs>): () => void {
    const callbacks = this.getSubscriptions(type);
    callbacks.add(callback);

    return () => this.unsubscribe(type, callback);
  }

  private unsubscribe(type: TKey, callback: SubscriptionHandler<THandlerArgs>): void {
    const callbacks = this.getSubscriptions(type);
    callbacks.delete(callback);
  }

  notifySubscribers(types: TKey[], args: THandlerArgs): void {
    const allSubscriptions = new Set<SubscriptionHandler<THandlerArgs>>();
    types.forEach((type) => {
      const subscriptions = this.getSubscriptions(type);
      subscriptions.forEach((s) => allSubscriptions.add(s));
    });

    allSubscriptions.forEach((s) => (s(args)));
  }
}
