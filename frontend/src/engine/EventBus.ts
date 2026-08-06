export type EventHandler = (...args: any[]) => void;

export class EventBus {
  private listeners: Map<string, EventHandler[]> = new Map();

  on(event: string, handler: EventHandler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler);
  }

  off(event: string, handler: EventHandler) {
    if (!this.listeners.has(event)) return;
    const handlers = this.listeners.get(event)!;
    this.listeners.set(event, handlers.filter(h => h !== handler));
  }

  emit(event: string, ...args: any[]) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event)!.forEach(handler => handler(...args));
  }
}
