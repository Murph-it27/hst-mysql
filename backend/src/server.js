require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');

const app = express();
app.set('trust proxy', 1); // behind Render/Netlify-style proxies
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
// limit login/signup attempts per IP (protects a public site from password guessing)
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }));
app.use('/api', routes);

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error, please try again' });
});

const PORT = Number(process.env.PORT || 4000);
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => console.log(`HST API running on http://0.0.0.0:${PORT}`));
}
module.exports = app;
