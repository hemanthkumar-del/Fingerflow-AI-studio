import { GestureProfile } from '../../GestureProfile';

export const writingGestureProfile: GestureProfile = {
  id: 'writing',
  name: 'Writing Mode',
  mappings: [
    { gesture: 'DRAW', action: 'Write', description: 'Write with index finger' },
    { gesture: 'PAUSE', action: 'Erase', description: 'Erase with open palm' },
    { gesture: 'HOME_DASHBOARD', action: 'Erase', description: 'Erase with open palm' }
  ]
};
