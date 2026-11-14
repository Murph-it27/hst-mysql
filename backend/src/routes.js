const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('./db');
const { signToken, requireAuth } = require('./auth');

const router = express.Router();

// ------------------------------ VALIDATION ------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USER_RE = /^[a-z0-9_]{3,20}$/;

const normEmail = (e) => String(e || '').trim().toLowerCase();
const normUser = (u) => String(u || '').trim().toLowerCase();

// ------------------------------ AUTH ------------------------------

// SIGNUP
router.post('/auth/signup', async (req, res, next) => {
  try {
    const username = normUser(req.body.username);
    const email = normEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!USER_RE.test(username)) {
      return res.status(400).json({
        error: 'User ID must be 3-20 characters: letters, numbers or underscore'
      });
    }

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({
        error: 'Please enter a valid email address'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password should be at least 6 characters'
      });
    }

    const [byEmail] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (byEmail.length) {
      return res.status(409).json({
        error: 'This email is already registered'
      });
    }

    const [byName] = await pool.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (byName.length) {
      return res.status(409).json({
        error: 'This User ID is already taken'
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hash]
    );

    const user = {
      id: result.insertId,
      email,
      username
    };

    res.status(201).json({
      token: signToken(user),
      user: {
        uid: String(user.id),
        email,
        username
      }
    });

  } catch (err) {
    next(err);
  }
});


// LOGIN
// User can log in using email or User ID
router.post('/auth/login', async (req, res, next) => {
  try {
    const identifier = String(
      req.body.identifier || req.body.email || ''
    ).trim().toLowerCase();

    const password = String(req.body.password || '');

    const [rows] = await pool.query(
      `SELECT id, username, email, password_hash
       FROM users
       WHERE email = ? OR username = ?
       LIMIT 1`,
      [identifier, identifier]
    );

    const row = rows[0];

    if (!row || !(await bcrypt.compare(password, row.password_hash))) {
      return res.status(401).json({
        error: 'Invalid email / User ID or password'
      });
    }

    res.json({
      token: signToken(row),
      user: {
        uid: String(row.id),
        email: row.email,
        username: row.username
      }
    });

  } catch (err) {
    next(err);
  }
});


// FORGOT PASSWORD
router.post('/auth/forgot-password', async (req, res, next) => {
  try {
    const email = normEmail(req.body.email);

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({
        error: 'Please enter a valid email address'
      });
    }

    if (!process.env.SMTP_HOST) {
      return res.status(503).json({
        error: 'Password reset is not available right now'
      });
    }

    const [rows] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (rows.length) {
      const temp = crypto.randomBytes(5).toString('hex');

      const hash = await bcrypt.hash(temp, 10);

      await pool.query(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [hash, rows[0].id]
      );

      const nodemailer = require('nodemailer');

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        auth: process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS
            }
          : undefined
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Household Stock Tracker - password reset',
        text: `Your temporary password is: ${temp}\nPlease log in and change it.`
      });
    }

    // Same response whether or not the account exists
    res.json({
      message: 'If this email is registered, a reset message has been sent.'
    });

  } catch (err) {
    next(err);
  }
});


// ------------------------------ ITEMS ------------------------------

// Supported inventory categories
const VALID_CATEGORIES = [
  'Fruits & Vegetables',
  'Dairy & Eggs',
  'Groceries & Staples',
  'Snacks & Beverages',
  'Cleaning Supplies',
  'Personal Care',
  'Laundry',
  'Health & First Aid',
  'Pet Supplies'
];


// Convert MySQL item data into frontend format
const toItem = (r) => ({
  id: String(r.id),
  name: r.name,
  description: r.description || '',
  category: r.category,
  quantity: Number(r.quantity),
  unit: r.unit || 'pcs',
  minimumStock: Number(r.minimum_stock ?? 1),
  expiryDate: r.expiry_date
    ? String(r.expiry_date).slice(0, 10)
    : null,
  notes: r.notes || '',
  imageUrl: r.image_url || null
});


// Validate inventory item details
const validate = (b) => {
  if (!b.name || !String(b.name).trim()) {
    return 'Name is required';
  }

  if (!VALID_CATEGORIES.includes(b.category)) {
    return 'Please select a valid category';
  }

  if (
    b.quantity === undefined ||
    b.quantity === null ||
    b.quantity === '' ||
    !Number.isFinite(Number(b.quantity)) ||
    Number(b.quantity) < 0
  ) {
    return 'Quantity must be zero or greater';
  }

  if (
    b.minimumStock !== undefined &&
    (
      !Number.isFinite(Number(b.minimumStock)) ||
      Number(b.minimumStock) < 0
    )
  ) {
    return 'Minimum stock must be zero or greater';
  }

  if (
    b.expiryDate &&
    !/^\d{4}-\d{2}-\d{2}$/.test(String(b.expiryDate))
  ) {
    return 'Please enter a valid date in YYYY-MM-DD format';
  }

  return null;
};


// GET ALL ITEMS
router.get('/items', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT *
       FROM items
       WHERE user_id = ?
       ORDER BY expiry_date IS NULL ASC, expiry_date ASC, id ASC`,
      [req.user.id]
    );

    res.json(rows.map(toItem));

  } catch (err) {
    next(err);
  }
});


// ADD NEW ITEM
router.post('/items', requireAuth, async (req, res, next) => {
  try {
    const bad = validate(req.body);

    if (bad) {
      return res.status(400).json({ error: bad });
    }

    const b = req.body;

    const [result] = await pool.query(
      `INSERT INTO items
      (
        user_id,
        name,
        description,
        category,
        quantity,
        unit,
        minimum_stock,
        expiry_date,
        notes,
        image_url
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        String(b.name).trim(),
        b.description || '',
        b.category,
        Number(b.quantity),
        b.unit || 'pcs',
        Number(b.minimumStock ?? 1),
        b.expiryDate || null,
        b.notes || '',
        b.imageUrl || null
      ]
    );

    res.status(201).json({
      id: String(result.insertId)
    });

  } catch (err) {
    next(err);
  }
});


// UPDATE EXISTING ITEM
router.put('/items/:id', requireAuth, async (req, res, next) => {
  try {
    const bad = validate(req.body);

    if (bad) {
      return res.status(400).json({ error: bad });
    }

    const b = req.body;

    const [result] = await pool.query(
      `UPDATE items
       SET
         name = ?,
         description = ?,
         category = ?,
         quantity = ?,
         unit = ?,
         minimum_stock = ?,
         expiry_date = ?,
         notes = ?,
         image_url = ?
       WHERE id = ? AND user_id = ?`,
      [
        String(b.name).trim(),
        b.description || '',
        b.category,
        Number(b.quantity),
        b.unit || 'pcs',
        Number(b.minimumStock ?? 1),
        b.expiryDate || null,
        b.notes || '',
        b.imageUrl || null,
        req.params.id,
        req.user.id
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        error: 'Item not found'
      });
    }

    res.json({ ok: true });

  } catch (err) {
    next(err);
  }
});


// DELETE ITEM
router.delete('/items/:id', requireAuth, async (req, res, next) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        error: 'Item not found'
      });
    }

    res.json({ ok: true });

  } catch (err) {
    next(err);
  }
});


/* --------------------------- SHOPPING LIST --------------------------- */

const toShoppingItem = (row) => ({
  id: String(row.id),
  name: row.name,
  quantity: Number(row.quantity),
  unit: row.unit,
  isPurchased: Boolean(row.is_purchased),
});

// GET all shopping list items for the logged-in user
router.get('/shopping-list', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM shopping_list_items
       WHERE user_id = ?
       ORDER BY is_purchased ASC, created_at DESC, id DESC`,
      [req.user.id]
    );

    res.json(rows.map(toShoppingItem));
  } catch (err) {
    next(err);
  }
});

// ADD a shopping list item
router.post('/shopping-list', requireAuth, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const quantity = Number(req.body.quantity);
    const unit = String(req.body.unit || 'pcs').trim() || 'pcs';

    if (!name) {
      return res.status(400).json({ error: 'Item name is required' });
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than zero' });
    }

    const [result] = await pool.query(
      `INSERT INTO shopping_list_items
       (user_id, name, quantity, unit, is_purchased)
       VALUES (?, ?, ?, ?, FALSE)`,
      [req.user.id, name, quantity, unit]
    );

    res.status(201).json({ id: String(result.insertId) });
  } catch (err) {
    next(err);
  }
});

// UPDATE a shopping list item
router.put('/shopping-list/:id', requireAuth, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const quantity = Number(req.body.quantity);
    const unit = String(req.body.unit || 'pcs').trim() || 'pcs';
    const isPurchased = Boolean(req.body.isPurchased);

    if (!name) {
      return res.status(400).json({ error: 'Item name is required' });
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than zero' });
    }

    const [result] = await pool.query(
      `UPDATE shopping_list_items
       SET name = ?, quantity = ?, unit = ?, is_purchased = ?
       WHERE id = ? AND user_id = ?`,
      [
        name,
        quantity,
        unit,
        isPurchased,
        req.params.id,
        req.user.id,
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Shopping list item not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// DELETE a shopping list item
router.delete('/shopping-list/:id', requireAuth, async (req, res, next) => {
  try {
    const [result] = await pool.query(
      `DELETE FROM shopping_list_items
       WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Shopping list item not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});


// CLEAR ALL PURCHASED SHOPPING LIST ITEMS
router.delete(
  '/shopping-list/purchased/clear',
  requireAuth,
  async (req, res, next) => {
    try {
      const [result] = await pool.query(
        `DELETE FROM shopping_list_items
         WHERE user_id = ? AND is_purchased = TRUE`,
        [req.user.id]
      );

      res.json({
        ok: true,
        deletedCount: result.affectedRows,
      });
    } catch (err) {
      next(err);
    }
  }
);



// ------------------------------ EXPORT ------------------------------
module.exports = router;

