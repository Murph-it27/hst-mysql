const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('./db');
const { signToken, requireAuth } = require('./auth');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normEmail = (e) => String(e || '').trim().toLowerCase();
const normUser = (u) => String(u || '').trim().toLowerCase();
const USER_RE = /^[a-z0-9_]{3,20}$/;

/* ------------------------------ AUTH ------------------------------ */

router.post('/auth/signup', async (req, res, next) => {
  try {
    const username = normUser(req.body.username);
    const email = normEmail(req.body.email);
    const password = String(req.body.password || '');
    if (!USER_RE.test(username)) {
      return res.status(400).json({ error: 'User ID must be 3-20 characters: letters, numbers or underscore' });
    }
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email address' });
    if (password.length < 6) return res.status(400).json({ error: 'Password should be at least 6 characters' });

    const [byEmail] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (byEmail.length) return res.status(409).json({ error: 'This email is already registered' });
    const [byName] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (byName.length) return res.status(409).json({ error: 'This User ID is already taken' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', [username, email, hash]);
    const user = { id: result.insertId, email, username };
    res.status(201).json({ token: signToken(user), user: { uid: String(user.id), email, username } });
  } catch (err) { next(err); }
});

// "identifier" can be the e-mail OR the User ID
router.post('/auth/login', async (req, res, next) => {
  try {
    const identifier = String(req.body.identifier || req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const [rows] = await pool.query(
      'SELECT id, username, email, password_hash FROM users WHERE email = ? OR username = ? LIMIT 1',
      [identifier, identifier]);
    const row = rows[0];
    if (!row || !(await bcrypt.compare(password, row.password_hash))) {
      return res.status(401).json({ error: 'Invalid email / User ID or password' });
    }
    res.json({ token: signToken(row), user: { uid: String(row.id), email: row.email, username: row.username } });
  } catch (err) { next(err); }
});

// Replacement for Firebase's sendPasswordResetEmail:
// sets a random temporary password and e-mails it (or prints it to the console if SMTP isn't configured).
router.post('/auth/forgot-password', async (req, res, next) => {
  try {
    const email = normEmail(req.body.email);
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email address' });

    // On a public site, never change someone's password unless we can actually e-mail them.
    if (!process.env.SMTP_HOST) {
      return res.status(503).json({ error: 'Password reset is not available right now' });
    }
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length) {
      const temp = crypto.randomBytes(5).toString('hex'); // 10 chars
      await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [await bcrypt.hash(temp, 10), rows[0].id]);

      if (process.env.SMTP_HOST) {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
        });
        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: email,
          subject: 'Household Stock Tracker - password reset',
          text: `Your temporary password is: ${temp}\nPlease log in and change it.`,
        });
      } else {
        console.log(`[forgot-password] temporary password for ${email}: ${temp}`);
      }
    }
    // Same response whether or not the account exists (don't leak registered emails)
    res.json({ message: 'If this email is registered, a reset message has been sent.' });
  } catch (err) { next(err); }
});

/* ------------------------------ ITEMS ------------------------------ */

const toItem = (r) => ({
  id: String(r.id),
  name: r.name,
  description: r.description || '',
  category: r.category,
  quantity: r.quantity,
  expiryDate: r.expiry_date, // 'YYYY-MM-DD'
  notes: r.notes || '',
});

const validate = (b) => {
  if (!b.name || !String(b.name).trim()) return 'Name is required';
  if (!['grocery', 'cleaning'].includes(b.category)) return 'Category must be grocery or cleaning';
  if (!Number.isInteger(Number(b.quantity)) || Number(b.quantity) <= 0) return 'Quantity must be a positive number';
  if (!/^\d{4}-\d{2}-\d{2}/.test(String(b.expiryDate || ''))) return 'Please enter a valid date';
  return null;
};

router.get('/items', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM items WHERE user_id = ? ORDER BY expiry_date ASC, id ASC', [req.user.id]);
    res.json(rows.map(toItem));
  } catch (err) { next(err); }
});

router.post('/items', requireAuth, async (req, res, next) => {
  try {
    const bad = validate(req.body);
    if (bad) return res.status(400).json({ error: bad });
    const b = req.body;
    const [result] = await pool.query(
      `INSERT INTO items (user_id, name, description, category, quantity, expiry_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, String(b.name).trim(), b.description || '', b.category, Number(b.quantity),
       String(b.expiryDate).slice(0, 10), b.notes || '']);
    res.status(201).json({ id: String(result.insertId) });
  } catch (err) { next(err); }
});

router.put('/items/:id', requireAuth, async (req, res, next) => {
  try {
    const bad = validate(req.body);
    if (bad) return res.status(400).json({ error: bad });
    const b = req.body;
    const [result] = await pool.query(
      `UPDATE items SET name = ?, description = ?, category = ?, quantity = ?, expiry_date = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
      [String(b.name).trim(), b.description || '', b.category, Number(b.quantity),
       String(b.expiryDate).slice(0, 10), b.notes || '', req.params.id, req.user.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Item not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.delete('/items/:id', requireAuth, async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Item not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
