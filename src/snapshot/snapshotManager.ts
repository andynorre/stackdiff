import * as fs from 'fs';
import * as path from 'path';
import { EnvMap } from '../parser/envParser';

export interface Snapshot {
  id: string;
  label: string;
  timestamp: string;
  envMaps: Record<string, EnvMap>;
}

export function createSnapshot(
  label: string,
  envMaps: Record<string, EnvMap>
): Snapshot {
  return {
    id: generateId(),
    label,
    timestamp: new Date().toISOString(),
    envMaps,
  };
}

export function saveSnapshot(snapshot: Snapshot, dir: string): string {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filename = `${snapshot.timestamp.replace(/[:.]/g, '-')}_${snapshot.label}.json`;
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2), 'utf-8');
  return filepath;
}

export function loadSnapshot(filepath: string): Snapshot {
  const raw = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(raw) as Snapshot;
}

export function listSnapshots(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(dir, f))
    .sort();
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}
