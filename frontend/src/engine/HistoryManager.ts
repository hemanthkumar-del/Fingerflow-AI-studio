import { Command } from './Command';
import { EventBus } from './EventBus';

export class HistoryManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private eventBus: EventBus;
  private maxHistory: number = 50;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  public execute(command: Command) {
    command.execute();
    this.undoStack.push(command);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    // Clear redo stack on new action
    this.redoStack = [];
    this.notifyState();
  }

  public getCommands(): Command[] {
    return [...this.undoStack];
  }

  public undo() {
    if (this.undoStack.length === 0) return;
    const command = this.undoStack.pop()!;
    command.undo();
    this.redoStack.push(command);
    this.notifyState();
  }

  public redo() {
    if (this.redoStack.length === 0) return;
    const command = this.redoStack.pop()!;
    command.execute(); // Redo is essentially executing again
    this.undoStack.push(command);
    this.notifyState();
  }

  public clear() {
    this.undoStack = [];
    this.redoStack = [];
    this.notifyState();
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  private notifyState() {
    this.eventBus.emit('history:changed', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    });
  }
}
