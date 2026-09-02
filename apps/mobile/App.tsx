import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/lib/auth';
import { syncQueue } from './src/lib/offlineQueue';
import RootNavigation from './src/navigation';

export default function App() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Best-effort background sync whenever the app returns to the foreground,
    // so field workers don't have to remember to tap "Sync now" every time.
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        syncQueue().catch(() => {
          // Silent - the pending-count banner in InstitutionListScreen surfaces
          // this to the user, no need to interrupt with an error here.
        });
      }
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootNavigation />
    </AuthProvider>
  );
}
