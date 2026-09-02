import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api, Institution } from '../lib/api';
import { getPendingCount, syncQueue } from '../lib/offlineQueue';
import { useAuth } from '../lib/auth';

export default function InstitutionListScreen({ navigation }: any) {
  const { logout, user } = useAuth();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadInstitutions() {
    try {
      const data = await api.getInstitutions();
      setInstitutions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load institutions');
    }
  }

  async function refreshPendingCount() {
    setPendingCount(await getPendingCount());
  }

  useFocusEffect(
    useCallback(() => {
      refreshPendingCount();
    }, []),
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadInstitutions();
      await refreshPendingCount();
      setLoading(false);
    })();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await loadInstitutions();
    await refreshPendingCount();
    setRefreshing(false);
  }

  async function handleSync() {
    setSyncing(true);
    const result = await syncQueue();
    await refreshPendingCount();
    if (result.synced > 0) {
      await loadInstitutions();
    }
    setSyncing(false);
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Institutions</Text>
          <Text style={styles.headerSubtitle}>{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {pendingCount > 0 && (
        <View style={styles.pendingBanner}>
          <Text style={styles.pendingText}>
            {pendingCount} record{pendingCount > 1 ? 's' : ''} waiting to sync
          </Text>
          <TouchableOpacity onPress={handleSync} disabled={syncing}>
            {syncing ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <Text style={styles.syncNow}>Sync now</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={institutions}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={styles.empty}>No institutions yet. Add one to get started.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>
                {item.type} · {item.ownership}
              </Text>
              <TouchableOpacity
                style={styles.addFacilityLink}
                onPress={() =>
                  navigation.navigate('AddFacility', {
                    institutionId: item.id,
                    institutionName: item.name,
                  })
                }
              >
                <Text style={styles.addFacilityLinkText}>+ Log facility condition</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddInstitution')}
      >
        <Text style={styles.fabText}>+ Add Institution</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 56,
    backgroundColor: '#0f172a',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerSubtitle: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  logout: { color: '#e2e8f0', fontSize: 13 },
  pendingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 12,
    paddingHorizontal: 16,
  },
  pendingText: { color: '#92400e', fontSize: 13, fontWeight: '600' },
  syncNow: { color: '#0f172a', fontSize: 13, fontWeight: '700' },
  error: { color: '#dc2626', padding: 16 },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  cardMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  addFacilityLink: { marginTop: 8 },
  addFacilityLinkText: { color: '#0ea5e9', fontSize: 13, fontWeight: '600' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    left: 20,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
