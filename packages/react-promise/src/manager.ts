import {Factory, State} from './types';
import {ReferenceCountedInvokableCache} from './cache';
import {
  createInvokable,
  Invokable,
  SubscriberFunction as InvokableSubscriberFunction,
  UnsubscribeFunction as InvokableUnsubscribeFunction,
} from './invokable';

export interface SubscriberFunction<Value>
  extends InvokableSubscriberFunction<Value> {}

export interface UnsubscribeFunction extends InvokableUnsubscribeFunction {}

function isInvokable<Value>(
  invokable: Invokable<Value> | undefined,
): invokable is Invokable<Value> {
  return (invokable as Invokable<Value>) !== undefined;
}

export class InvokableManager<Parameters extends unknown[], Value> {
  private cache: ReferenceCountedInvokableCache;
  private invokable: Invokable<Value> | undefined = undefined;
  private unsubscribe: UnsubscribeFunction | undefined = undefined;
  private subscribers: Set<SubscriberFunction<Value>> = new Set();

  public constructor(cache: ReferenceCountedInvokableCache) {
    this.cache = cache;
  }

  private notifySubscribers(state: State<Value>): void {
    for (const subscriber of this.subscribers) {
      subscriber(state);
    }
  }

  public getState(): State<Value> {
    return (
      this.invokable?.getState() || {
        status: undefined,
        value: undefined,
        error: undefined,
        isPending: false,
        isFulfilled: false,
        isRejected: false,
      }
    );
  }

  public getSuspender(): Promise<void> | undefined {
    if (!isInvokable(this.invokable)) {
      throw new Error();
    }

    // TODO: wait for promise to resolve
    return this.invokable.getSuspender();
  }

  public init(
    factory: Factory<Parameters, Value>,
    parameters: Parameters,
  ): void {
    const keys = [factory, ...parameters];

    // retrieve the invokable from the cache if there is one in the cache
    let nextInvoker = this.cache.get<Value>(keys);

    // create and store the invokable in the cache if there wasn't one in the cache
    if (!nextInvoker) {
      nextInvoker = createInvokable(factory, parameters);
      this.cache.set(keys, nextInvoker);
    }

    // if the invoker has changed then
    if (nextInvoker !== this.invokable) {
      this.reset();

      // subscribe to the next invoker and forward the notifications to our
      // subscribers
      nextInvoker?.subscribe((nextState) => {
        this.notifySubscribers(nextState);
      });

      // start using the next invoker
      this.invokable = nextInvoker;
    }
  }

  public reset(): void {
    // unsubscribe from the previous invokable
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.invokable = undefined;
    // TODO: dereference the invokable so it will get removed from the cache
  }

  public invoke(
    factory: Factory<Parameters, Value>,
    parameters: Parameters,
  ): Promise<Value> {
    const keys = [factory, ...parameters];

    // retrieve the invokable from the cache if there is one in the cache
    let nextInvoker = this.cache.get<Value>(keys);

    // create and store the invokable in the cache if there wasn't one in the cache
    if (!nextInvoker) {
      nextInvoker = createInvokable(factory, parameters);
      this.cache.set(keys, nextInvoker);
    }

    // if the invoker has changed then
    if (nextInvoker !== this.invokable) {
      this.reset();

      // subscribe to the next invoker and forward the notifications to our
      // subscribers
      nextInvoker?.subscribe((nextState) => {
        this.notifySubscribers(nextState);
      });

      // start using the next invoker
      this.invokable = nextInvoker;
    }

    return this.invokable.invoke();
  }

  public subscribe(subscriber: SubscriberFunction<Value>): UnsubscribeFunction {
    this.subscribers.add(subscriber);
    subscriber(this.getState());
    return () => this.subscribers.delete(subscriber);
  }
}
