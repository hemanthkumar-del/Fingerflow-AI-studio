export interface GestureSettings {
  soundEnabled: boolean;
  confirmationDurationMs: number; // For overlay animation
  confidenceThreshold: number; // Base confidence (0-100) needed to trigger
  globalDebounceMultiplier: number; // To scale debounce times up/down
  enabledGestures: Record<string, boolean>; // Map of gesture IDs to enabled state
  activeProfile: 'Artist' | 'Student' | 'Teacher' | 'Designer';
}

const DEFAULT_SETTINGS: GestureSettings = {
  soundEnabled: true,
  confirmationDurationMs: 1500,
  confidenceThreshold: 85, // 85% default
  globalDebounceMultiplier: 1.0,
  enabledGestures: {}, // Empty means all enabled by default in registry
  activeProfile: 'Artist',
};

export class SettingsManager {
  private static readonly STORAGE_KEY = 'fingerflow_gesture_settings';

  public static getSettings(): GestureSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to load gesture settings from LocalStorage');
    }
    return { ...DEFAULT_SETTINGS };
  }

  public static saveSettings(settings: GestureSettings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save gesture settings to LocalStorage');
    }
  }

  public static isGestureEnabled(gestureId: string): boolean {
    const settings = this.getSettings();
    // If not explicitly disabled, it's enabled
    return settings.enabledGestures[gestureId] !== false;
  }
}
