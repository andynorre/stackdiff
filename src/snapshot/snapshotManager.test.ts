import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  createSnapshot,
  saveSnapshot,
  loadSnapshot,
  listSnapshots,
} from './snapshotManager';

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stackdiff-snap-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('createSnapshot', () => {
  it('creates a snapshot with correct shape', () => {
    const envMaps = { '.env': { FOO: 'bar' } };
    const snap = createSnapshot('test-label', envMaps);
    expect(snap.label).toBe('test-label');
    expect(snap.envMaps).toEqual(envMaps);
    expect(snap.id).toBeTruthy();
    expect(snap.timestamp).toBeTruthy();
  });
});

describe('saveSnapshot / loadSnapshot', () => {
  it('round-trips a snapshot to disk', () => {
    const envMaps = { '.env.prod': { API_KEY: 'secret', PORT: '3000' } };
    const snap = createSnapshot('prod', envMaps);
    const filepath = saveSnapshot(snap, tmpDir);
    expect(fs.existsSync(filepath)).toBe(true);
    const loaded = loadSnapshot(filepath);
    expect(loaded.label).toBe('prod');
    expect(loaded.envMaps).toEqual(envMaps);
  });
});

describe('listSnapshots', () => {
  it('returns empty array when dir does not exist', () => {
    expect(listSnapshots('/nonexistent/path')).toEqual([]);
  });

  it('lists saved snapshots sorted', () => {
    const snap1 = createSnapshot('alpha', { '.env': { A: '1' } });
    const snap2 = createSnapshot('beta', { '.env': { B: '2' } });
    saveSnapshot(snap1, tmpDir);
    saveSnapshot(snap2, tmpDir);
    const list = listSnapshots(tmpDir);
    expect(list).toHaveLength(2);
    list.forEach((f) => expect(f.endsWith('.json')).toBe(true));
  });
});
