import React, { useEffect, useState } from 'react';
import { Card, Button, Row, Col, Badge } from 'react-bootstrap';
import {
  loadRecordsFromIndexedDB,
  saveRecordsToIndexedDB,
  loadRecordsFromLocalStorage,
  saveRecordsToLocalStorage,
} from '../idb';
import { fetchServerRecords, postServerRecord, postServerReset } from '../api';

function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}
function lastNDates(n) {
  const arr = [];
  for (let i = n - 1; i >= 0; i--) arr.push(todayISO(-i));
  return arr;
}
function computeStreak(records) {
  let streak = 0;
  for (let i = 0; ; i++) {
    const d = todayISO(-i);
    if (records && records[d]) streak++;
    else break;
  }
  return streak;
}

export default function HabitTracker({ habitName = 'Drink Water' }) {
  const [records, setRecords] = useState({});
  const [usingIndexedDB, setUsingIndexedDB] = useState(false);
  const [serverAvailable, setServerAvailable] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const fromServer = await fetchServerRecords();
      if (fromServer) {
        setServerAvailable(true);
        if (mounted) {
          setRecords(fromServer);
          try {
            await saveRecordsToIndexedDB(fromServer);
            setUsingIndexedDB(true);
          } catch {
            saveRecordsToLocalStorage(fromServer);
          }
        }
        return;
      }
      try {
        const r = await loadRecordsFromIndexedDB();
        if (mounted) {
          setRecords(r || {});
          setUsingIndexedDB(true);
        }
      } catch {
        const r = loadRecordsFromLocalStorage();
        if (mounted) setRecords(r || {});
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  async function persist(newRecords) {
    const serverOk = await postServerRecord(todayISO(), !!newRecords[todayISO()]);
    if (serverOk) setServerAvailable(true);
    try {
      await saveRecordsToIndexedDB(newRecords);
      setUsingIndexedDB(true);
    } catch {
      saveRecordsToLocalStorage(newRecords);
      setUsingIndexedDB(false);
    }
  }

  async function markDoneForToday() {
    const d = todayISO();
    const newRecords = { ...records, [d]: true };
    setRecords(newRecords);
    await persist(newRecords);
  }

  async function resetAll() {
    setRecords({});
    const serverReset = await postServerReset();
    if (serverReset) setServerAvailable(true);
    try {
      await saveRecordsToIndexedDB({});
      setUsingIndexedDB(true);
    } catch {
      saveRecordsToLocalStorage({});
      setUsingIndexedDB(false);
    }
  }

  const last7 = lastNDates(7);
  const streak = computeStreak(records);

  return (
    <Card style={{ padding: 20, borderRadius: 12, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ marginBottom: 4 }}>{habitName}</h3>
          <div style={{ color: '#6b7280' }}>Quick daily habit logger</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 36, fontWeight: 700 }}>{streak}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>current streak (days)</div>
        </div>
      </div>

      <hr />

      <Row style={{ gap: 8, marginBottom: 16 }}>
        {last7.map((d) => {
          const short = d.slice(5);
          const done = !!records[d];
          return (
            <Col key={d} xs="auto">
              <div
                style={{
                  borderRadius: 8,
                  padding: 10,
                  textAlign: 'center',
                  border: '1px solid #e5e7eb',
                  background: done ? '#d1fae5' : '#fff',
                  height: 80,
                  width: 80,
                }}
              >
                <div style={{ fontSize: 12, color: '#6b7280' }}>{short}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{done ? '✔' : '—'}</div>
              </div>
            </Col>
          );
        })}
      </Row>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button variant="success" onClick={markDoneForToday}>Mark Done</Button>
        <Button variant="outline-danger" onClick={resetAll}>Reset</Button>
        <small style={{ marginLeft: 'auto', color: '#6b7280' }}>
          Storage: {usingIndexedDB ? 'IndexedDB' : 'localStorage'} {serverAvailable && '· Server synced'}
        </small>
      </div>

      <hr />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <strong>History</strong>
          <div style={{ fontSize: 13, color: '#6b7280' }}>All marked days are stored</div>
        </div>
        <Badge bg="info">{Object.keys(records).length} total</Badge>
      </div>
    </Card>
  );
}
