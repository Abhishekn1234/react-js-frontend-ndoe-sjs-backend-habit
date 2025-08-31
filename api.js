const BASE =  'http://localhost:4000';

export async function fetchServerRecords() {
  try {
    const res = await fetch(`${BASE}/api/habit`);
    if (!res.ok) throw new Error('server error');
    const json = await res.json();
    return json.records || {};
  } catch (e) {
    
    return null;
  }
}

export async function postServerRecord(date, done) {
  try {
    const res = await fetch(`${BASE}/api/habit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, done }),
    });
    if (!res.ok) throw new Error('server error');
    return true;
  } catch (e) {
    return false;
  }
}

export async function postServerReset() {
  try {
    const res = await fetch(`${BASE}/api/reset`, {
      method: 'POST',
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}
