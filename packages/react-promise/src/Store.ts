/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  UnknownState,
  PendingState,
  FulfilledState,
  RejectedState,
} from './types';
import {equal} from 'fast-shallow-equal';

export type StoreKey = unknown[];

export type StoreState<Value = unknown> =
  | UnknownState
  | PendingState
  | FulfilledState<Value>
  | RejectedState;

export interface StoreSubscriber<Value> {
  (state: StoreState<Value>): void;
}

export class Store {
  private subscribers: StoreSubscriber<any>[] = [];

  private entries: [any[], StoreState<any>][] = [];

  private notifySubscribers(key: StoreKey): void {
    for (const subscriber of this.subscribers) {
      subscriber(this.getState(key));
    }
  }

  public getState<Value>(key: StoreKey): StoreState<Value> {
    const entry = this.entries.find(([k]) => equal(k, key));
    if (entry) {
      return entry[1];
    }
    return {
      status: undefined,
      value: undefined,
      error: undefined,
      suspender: undefined,
    };
  }

  public setState<Value>(key: StoreKey, state: StoreState<Value>): void {
    const index = this.entries.findIndex(([k]) => equal(k, key));
    const entry: [StoreKey, StoreState] = [key, state];
    if (index !== -1) {
      this.entries[index] = entry;
    } else {
      this.entries.push(entry);
    }
    this.notifySubscribers(key);
  }

  public clearState(key: StoreKey): void {
    const index = this.entries.findIndex(([k]) => equal(k, key));
    if (index !== -1) {
      this.entries.splice(index, 1);
    }
    this.notifySubscribers(key);
  }

  public subscribe<Value>(
    key: StoreKey,
    subscriber: StoreSubscriber<Value>,
  ): () => void {
    // subscribe
    this.subscribers.push(subscriber);

    // initialise the subscriber
    subscriber(this.getState<Value>(key));

    // unsubscribe
    return () => {
      const index = this.subscribers.indexOf(subscriber);
      if (index !== -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }
}
