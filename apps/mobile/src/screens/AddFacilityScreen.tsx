import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { api } from '../lib/api';
import { queueFacility } from '../lib/offlineQueue';

const CATEGORIES = ['CLASSROOM', 'TOILET', 'WATER', 'ELECTRICITY', 'LIBRARY', 'LABORATORY', 'OTHER'];
const CONDITIONS = ['GOOD', 'FAIR', 'POOR', 'NOT_FUNCTIONAL'];

const CONDITION_COLORS: Record<string, string> = {
  GOOD: '#16a34a',
  FAIR: '#eab308',
  POOR: '#f59e0b',
  NOT_FUNCTIONAL: '#dc2626',
};

export default function AddFacilityScreen({ route, navigation }: any) {
  const { institutionId, institutionName } = route.params;
  const [category, setCategory] = useState('CLASSROOM');
  const [condition, setCondition] = useState('GOOD');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    const payload = {
      institutionId,
      category,
      condition,
      notes: notes.trim() || undefined,
    };

    setSubmitting(true);
    try {
      await api.createFacility(payload);
      Alert.alert('Saved', 'Facility record submitted successfully.');
      navigation.goBack();
    } catch (err) {
      await queueFacility(payload);
      Alert.alert(
        'Saved offline',
        'No connection right now - this record is queued and will sync automatically.',
      );
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Log Facility Condition</Text>
      <Text style={styles.subtitle}>{institutionName}</Text>

      <Text style={styles.label}>Category</Text>
      <View style={styles.pillRow}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.pill, category === c && styles.pillActive]}
            onPress={() => setCategory(c)}
          >
            <Text style={[styles.pillText, category === c && styles.pillTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Condition</Text>
      <View style={styles.pillRow}>
        {CONDITIONS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.pill,
              condition === c && { backgroundColor: CONDITION_COLORS[c], borderColor: CONDITION_COLORS[c] },
            ]}
            onPress={() => setCondition(c)}
          >
            <Text style={[styles.pillText, condition === c && styles.pillTextActive]}>
              {c.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput
        style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
        value={notes}
        onChangeText={setNotes}
        multiline
        placeholder="e.g. Roof leaking, blocked drainage..."
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Save Facility Record</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2, marginBottom: 12 },
  label: { fontSize: 13, color: '#334155', marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap' },
  pill: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  pillActive: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  pillText: { fontSize: 13, color: '#334155' },
  pillTextActive: { color: '#fff' },
  error: { color: '#dc2626', fontSize: 13, marginTop: 16 },
  submitButton: {
    marginTop: 28,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
