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
import * as Location from 'expo-location';
import { api } from '../lib/api';
import { queueInstitution } from '../lib/offlineQueue';

const TYPES = ['PRIMARY', 'SECONDARY', 'UNIVERSITY'];
const OWNERSHIPS = ['GOVERNMENT', 'PRIVATE'];

export default function AddInstitutionScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [type, setType] = useState('PRIMARY');
  const [ownership, setOwnership] = useState('GOVERNMENT');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function captureLocation() {
    setError(null);
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission is required to geo-tag this institution.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
    } catch (err) {
      setError('Could not get current location. Try again or check GPS is enabled.');
    } finally {
      setLocating(false);
    }
  }

  async function handleSubmit() {
    setError(null);
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!coords) {
      setError('Capture the location before saving.');
      return;
    }

    const payload = {
      name: name.trim(),
      type,
      ownership,
      lat: coords.lat,
      lng: coords.lng,
      address: address.trim() || undefined,
    };

    setSubmitting(true);
    try {
      await api.createInstitution(payload);
      Alert.alert('Saved', 'Institution submitted successfully.');
      navigation.goBack();
    } catch (err) {
      // Network/API failure - queue locally rather than losing the field record.
      await queueInstitution(payload);
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
      <Text style={styles.title}>Add Institution</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Type</Text>
      <View style={styles.pillRow}>
        {TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.pill, type === t && styles.pillActive]}
            onPress={() => setType(t)}
          >
            <Text style={[styles.pillText, type === t && styles.pillTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Ownership</Text>
      <View style={styles.pillRow}>
        {OWNERSHIPS.map((o) => (
          <TouchableOpacity
            key={o}
            style={[styles.pill, ownership === o && styles.pillActive]}
            onPress={() => setOwnership(o)}
          >
            <Text style={[styles.pillText, ownership === o && styles.pillTextActive]}>{o}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Address (optional)</Text>
      <TextInput style={styles.input} value={address} onChangeText={setAddress} />

      <Text style={styles.label}>Location</Text>
      <TouchableOpacity style={styles.locationButton} onPress={captureLocation} disabled={locating}>
        {locating ? (
          <ActivityIndicator color="#0f172a" />
        ) : (
          <Text style={styles.locationButtonText}>
            {coords ? 'Recapture GPS location' : 'Capture current GPS location'}
          </Text>
        )}
      </TouchableOpacity>
      {coords && (
        <Text style={styles.coords}>
          {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
        </Text>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Save Institution</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginBottom: 20 },
  label: { fontSize: 13, color: '#334155', marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  locationButton: {
    borderWidth: 1,
    borderColor: '#0ea5e9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  locationButtonText: { color: '#0ea5e9', fontWeight: '600', fontSize: 14 },
  coords: { marginTop: 8, fontSize: 12, color: '#64748b', textAlign: 'center' },
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
