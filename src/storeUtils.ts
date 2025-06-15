import { useState, useEffect } from 'react';

/**
 * Simple store implementation for state management
 */
export class Store<T> {
  private state: T;
  private listeners: (() => void)[] = [];

  constructor(initialState: T) {
    this.state = initialState;
  }

  getState(): T {
    return this.state;
  }

  setState(newState: Partial<T>): void {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    this.state = { ...this.state, [key]: value };
    this.notifyListeners();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

export function useStore<T>(store: Store<T>): T {
  const [state, setState] = useState<T>(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState(store.getState());
    });
    return unsubscribe;
  }, [store]);

  return state;
}
