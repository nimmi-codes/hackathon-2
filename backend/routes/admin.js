const crypto = require('crypto');
const router = require('express').Router();
const Route = require('../models/Route');
const Report = require('../models/Report');

// Stateless signed token (survives Render restarts). Needs ADMIN_PASSWORD; TOKEN_SECRET optional.
const secret = () => process.env.TOKEN_SECRET || process.env.ADMIN_PASSWORD || '';
const sign = (payload) => crypto.createHmac('sha256', secret()).update(payload).digest('hex');

function issueToken() {
  const exp = Date.now() + 8 * 60 * 60 * 1000; // 8 hours
  return `${exp}.${sign(String(exp))}`;
}

function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  const [exp, sig] = token.split('.');
  const ok =
    secret() &&
    exp &&
    sig &&
    Number(exp) > Date.now() &&
    sig.length === sign(exp).length &&
    crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(sign(exp)));
  if (!ok) return res.status(401).json({ message: 'Unauthorized' });
  next();
}

const fail = (res, err) =>
  res.status(err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500).json({ message: err.message });

// POST /api/admin/login { password }
router.post('/login', (req, res) => {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return res.status(503).json({ message: 'ADMIN_PASSWORD is not configured on the server' });
  const given = Buffer.from(String(req.body.password || ''));
  const want = Buffer.from(expected);
  if (given.length !== want.length || !crypto.timingSafeEqual(given, want)) {
    return res.status(401).json({ message: 'Incorrect password' });
  }
  res.json({ token: issueToken() });
});

router.use(requireAdmin);

const ROUTE_FIELDS = ['area', 'district', 'routeNumber', 'truckNumber', 'collectionDays', 'collectionTime', 'wasteType', 'fee'];
const pick = (body) => Object.fromEntries(ROUTE_FIELDS.filter((k) => k in body).map((k) => [k, body[k]]));

router.get('/routes', async (req, res) => {
  try {
    res.json(await Route.find().sort({ district: 1, area: 1 }));
  } catch (err) {
    fail(res, err);
  }
});

router.post('/routes', async (req, res) => {
  try {
    res.status(201).json(await Route.create(pick(req.body)));
  } catch (err) {
    fail(res, err);
  }
});

router.put('/routes/:id', async (req, res) => {
  try {
    const doc = await Route.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: 'Route not found' });
    res.json(doc);
  } catch (err) {
    fail(res, err);
  }
});

router.delete('/routes/:id', async (req, res) => {
  try {
    const doc = await Route.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Route not found' });
    res.json({ ok: true });
  } catch (err) {
    fail(res, err);
  }
});

router.get('/reports', async (req, res) => {
  try {
    res.json(await Report.find().sort({ createdAt: -1 }).limit(500));
  } catch (err) {
    fail(res, err);
  }
});

router.patch('/reports/:id', async (req, res) => {
  try {
    const doc = await Report.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ message: 'Report not found' });
    res.json(doc);
  } catch (err) {
    fail(res, err);
  }
});

module.exports = router;
