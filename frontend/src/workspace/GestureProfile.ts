import { GestureType } from '../services/gestureClassifier';

/**
 * Maps physical gestures to abstract actions for a specific Workspace Mode.
 */
export interface GestureActionMap {
  gesture: GestureType;
  action: string;
  description: string;
}

export interface GestureProfile {
  id: string;
  name: string;
  mappings: GestureActionMap[];
}
