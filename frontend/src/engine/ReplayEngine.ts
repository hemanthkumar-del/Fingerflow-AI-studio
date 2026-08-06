import { CanvasManager } from './CanvasManager';
import { Command } from './Command';

export class ReplayEngine {
  private engine: CanvasManager;
  private isReplaying: boolean = false;
  private commands: Command[] = [];
  
  constructor(engine: CanvasManager) {
    this.engine = engine;
  }

  public startReplay(commandsToReplay: Command[], delayMs: number = 200) {
    if (this.isReplaying) return;
    this.isReplaying = true;
    this.commands = commandsToReplay;
    
    // Clear the canvas
    const canvas = (this.engine as any).canvas;
    canvas.clear();
    canvas.backgroundColor = '#000000'; // Or whatever config background is
    
    // Disable gestures during replay
    this.engine.eventBus.emit('replay:start', null);

    let currentIndex = 0;
    
    const next = () => {
      if (!this.isReplaying) return;
      if (currentIndex >= this.commands.length) {
        this.stopReplay();
        return;
      }
      
      const cmd = this.commands[currentIndex];
      cmd.execute();
      currentIndex++;
      
      this.engine.eventBus.emit('replay:progress', { current: currentIndex, total: this.commands.length });
      
      setTimeout(next, delayMs);
    };

    next();
  }

  public stopReplay() {
    this.isReplaying = false;
    this.engine.eventBus.emit('replay:end', null);
  }
}
