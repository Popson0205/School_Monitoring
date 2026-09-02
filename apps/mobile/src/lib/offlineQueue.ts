import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { api, CreateFacilityInput, CreateInstitutionInput } from './api';

const QUEUE_KEY = 'school_monitor_offline_queue';
const MAX_RETRIES = 5;

type QueuedRecord =
  | { id: string; type: 'institution'; payload: CreateInstitutionInput; retries: number; createdAt: string }
  | { id: string; type: 'facility'; payload: CreateFacilityInput; retries: number; createdAt: string };

async function readQueue(): Promise<QueuedRecord[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function writeQueue(queue: QueuedRecord[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function queueInstitution(payload: CreateInstitutionInput) {
  const queue = await readQueue();
  queue.push({
    id: generateId(),
    type: 'institution',
    payload,
    retries: 0,
    createdAt: new Date().toISOString(),
  });
  await writeQueue(queue);
}

export async function queueFacility(payload: CreateFacilityInput) {
  const queue = await readQueue();
  queue.push({
    id: generateId(),
    type: 'facility',
    payload,
    retries: 0,
    createdAt: new Date().toISOString(),
  });
  await writeQueue(queue);
}

export async function getPendingCount(): Promise<number> {
  const queue = await readQueue();
  return queue.length;
}

/**
 * Attempts to submit every queued record. Successful ones are removed;
 * failed ones stay queued with an incremented retry count, up to
 * MAX_RETRIES, after which they're kept but flagged (not silently dropped -
 * data loss for field-collected records is worse than a full queue).
 */
export async function syncQueue(): Promise<{ synced: number; failed: number; pending: number }> {
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    const queue = await readQueue();
    return { synced: 0, failed: 0, pending: queue.length };
  }

  const queue = await readQueue();
  const remaining: QueuedRecord[] = [];
  let synced = 0;
  let failed = 0;

  for (const record of queue) {
    try {
      if (record.type === 'institution') {
        await api.createInstitution(record.payload);
      } else {
        await api.createFacility(record.payload);
      }
      synced += 1;
    } catch {
      failed += 1;
      if (record.retries < MAX_RETRIES) {
        remaining.push({ ...record, retries: record.retries + 1 });
      } else {
        // Keep permanently-failed records visible rather than silently
        // dropping field data - surfaced via getPendingCount/getStuckCount.
        remaining.push(record);
      }
    }
  }

  await writeQueue(remaining);
  return { synced, failed, pending: remaining.length };
}

export async function getStuckCount(): Promise<number> {
  const queue = await readQueue();
  return queue.filter((r) => r.retries >= MAX_RETRIES).length;
}
