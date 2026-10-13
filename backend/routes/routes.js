const router = require('express').Router();
const Route = require('../models/Route');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/routes?search=colombo
router.get('/', async (req, res) => {
  try {
    const search = String(req.query.search || '').trim();
    const filter = search
      ? {
          $or: [
            { area: new RegExp(escapeRegex(search), 'i') },
            { district: new RegExp(escapeRegex(search), 'i') },
          ],
        }
      : {};
    const routes = await Route.find(filter).sort({ district: 1, area: 1 }).limit(100);
    res.json(routes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
