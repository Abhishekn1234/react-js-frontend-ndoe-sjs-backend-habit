const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data.json');

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { records: {} };
  }
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}


app.get('/api/habit', (req, res) => {
  const data = readData();
  res.json(data.records || {});
});


app.post('/api/habit', (req, res) => {
  const { date, done } = req.body;
  if (!date) return res.status(400).json({ error: 'Missing date' });

  const data = readData();
  data.records = data.records || {};

  if (done) data.records[date] = true;
  else delete data.records[date];

  writeData(data);
  res.json({ ok: true, records: data.records });
});


app.post('/api/reset', (req, res) => {
  const data = { records: {} };
  writeData(data);
  res.json({ ok: true });
});

const PORT = 4000;
app.listen(PORT, () => console.log(`✅ Server listening on http://localhost:${PORT}`));
