import { FingerState, Landmark, getDistance } from './gestureClassifier';
import { SettingsManager } from './gestureSettings';

export type GestureAction = 
  | 'SAVE_CLOUD' 
  | 'UNDO' 
  | 'REDO'
  | 'ERASER_MODE'
  | 'PAN_MODE'
  | 'COLOR_PICKER_MODE'
  | 'EXPORT_PNG'
  | 'AI_ENHANCE'
  | 'SCREENSHOT'
  | 'HOME_DASHBOARD'
  | 'OPEN_AI'
  | 'CLEAR_CANVAS'
  | 'SELECTION_MODE'
  | 'DUPLICATE_MODE'
  | 'DELETE_MODE'
  | 'NONE';

export interface GestureDefinition {
  id: string;
  name: string;
  type: 'STATIC' | 'DYNAMIC';
  action: GestureAction;
  icon: string;
  description: string;
  priority: number; // Higher number = higher priority
  cooldownMs: number; // Time before it can trigger again
  debounceMs: number; // Time the gesture must be held/recognized continuously
  check: (landmarks: Landmark[], fingerState: FingerState, velocityVec?: {dx: number, dy: number, speed: number}) => number; // Returns confidence 0-100
}

export class GestureRegistry {
  private static gestures: GestureDefinition[] = [];

  public static initialize() {
    this.gestures = [
      {
        id: 'thumb_up',
        name: 'Thumb Up',
        type: 'STATIC',
        action: 'SAVE_CLOUD',
        icon: '👍',
        description: 'Save to Cloud',
        priority: 10,
        cooldownMs: 2000,
        debounceMs: 400,
        check: (lm, fs) => {
          if (fs.thumb && !fs.index && !fs.middle && !fs.ring && !fs.pinky) {
            // Check if thumb is pointing UP (y of tip is much less than y of base)
            if (lm[4].y < lm[2].y - 0.05) return 95;
          }
          return 0;
        }
      },
      {
        id: 'thumb_down',
        name: 'Thumb Down',
        type: 'STATIC',
        action: 'UNDO',
        icon: '👎',
        description: 'Undo',
        priority: 10,
        cooldownMs: 1000,
        debounceMs: 400,
        check: (lm, fs) => {
          if (fs.thumb && !fs.index && !fs.middle && !fs.ring && !fs.pinky) {
            // Check if thumb is pointing DOWN
            if (lm[4].y > lm[2].y + 0.05) return 95;
          }
          return 0;
        }
      },
      {
        id: 'closed_fist',
        name: 'Closed Fist',
        type: 'STATIC',
        action: 'DELETE_MODE',
        icon: '✊',
        description: 'Delete Selection',
        priority: 5,
        cooldownMs: 500,
        debounceMs: 300,
        check: (lm, fs) => {
          if (!fs.thumb && !fs.index && !fs.middle && !fs.ring && !fs.pinky) {
            return 90;
          }
          return 0;
        }
      },
      {
        id: 'peace',
        name: 'Peace Sign',
        type: 'STATIC',
        action: 'SELECTION_MODE',
        icon: '✌️',
        description: 'Selection Mode',
        priority: 8,
        cooldownMs: 500,
        debounceMs: 300,
        check: (lm, fs) => {
          if (!fs.thumb && fs.index && fs.middle && !fs.ring && !fs.pinky) {
            return 92;
          }
          return 0;
        }
      },
      {
        id: 'three_fingers',
        name: 'Three Fingers',
        type: 'STATIC',
        action: 'COLOR_PICKER_MODE',
        icon: '🖖',
        description: 'Color Picker',
        priority: 8,
        cooldownMs: 500,
        debounceMs: 300,
        check: (lm, fs) => {
          if (!fs.thumb && fs.index && fs.middle && fs.ring && !fs.pinky) {
            return 90;
          }
          return 0;
        }
      },
      {
        id: 'love_sign',
        name: 'Love Sign',
        type: 'STATIC',
        action: 'EXPORT_PNG',
        icon: '🤟',
        description: 'Export PNG',
        priority: 15,
        cooldownMs: 3000,
        debounceMs: 600,
        check: (lm, fs) => {
          if (fs.thumb && fs.index && !fs.middle && !fs.ring && fs.pinky) {
            return 95;
          }
          return 0;
        }
      },
      {
        id: 'rock_sign',
        name: 'Rock Sign',
        type: 'STATIC',
        action: 'AI_ENHANCE',
        icon: '🤘',
        description: 'AI Enhance',
        priority: 15,
        cooldownMs: 3000,
        debounceMs: 600,
        check: (lm, fs) => {
          if (!fs.thumb && fs.index && !fs.middle && !fs.ring && fs.pinky) {
            return 95;
          }
          return 0;
        }
      },
      {
        id: 'ok',
        name: 'OK Sign',
        type: 'STATIC',
        action: 'DUPLICATE_MODE',
        icon: '👌',
        description: 'Duplicate Selection',
        priority: 15,
        cooldownMs: 1500,
        debounceMs: 400,
        check: (lm, fs) => {
          // Thumb and index touching (pinched), middle/ring/pinky up
          if (fs.middle && fs.ring && fs.pinky) {
            const pinchDist = getDistance(lm[4], lm[8]);
            const handScale = getDistance(lm[0], lm[9]);
            if (pinchDist / handScale < 0.3) {
              return 95;
            }
          }
          return 0;
        }
      },
      {
        id: 'open_palm',
        name: 'Open Palm',
        type: 'STATIC',
        action: 'HOME_DASHBOARD',
        icon: '✋',
        description: 'Home Dash',
        priority: 5,
        cooldownMs: 2000,
        debounceMs: 800, // needs to be held longer so PAUSE doesn't trigger Dash
        check: (lm, fs) => {
          if (fs.thumb && fs.index && fs.middle && fs.ring && fs.pinky) {
            return 85;
          }
          return 0;
        }
      },
      {
        id: 'swipe_left',
        name: 'Swipe Left',
        type: 'DYNAMIC',
        action: 'UNDO',
        icon: '⬅️',
        description: 'Undo',
        priority: 20,
        cooldownMs: 1000,
        debounceMs: 0, // Swipes trigger instantly on vector
        check: (lm, fs, vel) => {
          if (vel && vel.speed > 800 && vel.dx < -0.8 && Math.abs(vel.dy) < 0.4) {
            return Math.min(100, (vel.speed / 2000) * 100);
          }
          return 0;
        }
      },
      {
        id: 'swipe_right',
        name: 'Swipe Right',
        type: 'DYNAMIC',
        action: 'REDO',
        icon: '➡️',
        description: 'Redo',
        priority: 20,
        cooldownMs: 1000,
        debounceMs: 0,
        check: (lm, fs, vel) => {
          if (vel && vel.speed > 800 && vel.dx > 0.8 && Math.abs(vel.dy) < 0.4) {
            return Math.min(100, (vel.speed / 2000) * 100);
          }
          return 0;
        }
      },
      {
        id: 'swipe_up',
        name: 'Swipe Up',
        type: 'DYNAMIC',
        action: 'OPEN_AI',
        icon: '⬆️',
        description: 'Open AI',
        priority: 20,
        cooldownMs: 1000,
        debounceMs: 0,
        check: (lm, fs, vel) => {
          if (vel && vel.speed > 800 && vel.dy < -0.8 && Math.abs(vel.dx) < 0.4) {
            return Math.min(100, (vel.speed / 2000) * 100);
          }
          return 0;
        }
      },
      {
        id: 'swipe_down',
        name: 'Swipe Down',
        type: 'DYNAMIC',
        action: 'CLEAR_CANVAS',
        icon: '⬇️',
        description: 'Clear Canvas',
        priority: 20,
        cooldownMs: 2000,
        debounceMs: 0,
        check: (lm, fs, vel) => {
          if (vel && vel.speed > 800 && vel.dy > 0.8 && Math.abs(vel.dx) < 0.4) {
            return Math.min(100, (vel.speed / 2000) * 100);
          }
          return 0;
        }
      }
    ];
  }

  public static getActiveGestures(): GestureDefinition[] {
    if (this.gestures.length === 0) this.initialize();
    return this.gestures.filter(g => SettingsManager.isGestureEnabled(g.id));
  }
}
