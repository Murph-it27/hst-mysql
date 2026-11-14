const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error('JWT_SECRET is not set. Add it to backend/.env (or the hosting service environment variables).');
}

const signToken = (user) =>
  jwt.sign({ uid: user.id, email: user.email }, SECRET, { expiresIn: '7d' });

// Express middleware: requires "Authorization: Bearer <token>"
const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'User not authenticated' });
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = { id: payload.uid, email: payload.email };
    next();
  } catch {
    res.status(401).json({ error: 'Session expired, please log in again' });
  }
};

module.exports = { signToken, requireAuth };
