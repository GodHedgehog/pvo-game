export type Handler<T> = (payload: T) => void;

export class EventBus {
  private handlers = new Map<string, Set<Handler<unknown>>>();

  on<T>(event: string, fn: Handler<T>): () => void {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(fn as Handler<unknown>);
    return () => set!.delete(fn as Handler<unknown>);
  }

  emit<T>(event: string, payload: T): void {
    const set = this.handlers.get(event);
    if (!set) return;
    for (const fn of set) fn(payload);
  }
}
