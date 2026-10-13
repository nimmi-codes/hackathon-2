const router = require('express').Router();
const Report = require('../models/Report');

// POST /api/reports
router.post('/', async (req, res) => {
  try {
    const { type, area, description, reporterName, contact } = req.body;
    const report = await Report.create({ type, area, description, reporterName, contact });
    res.status(201).json(report);
  } catch (err) {
    const code = err.name === 'ValidationError' ? 400 : 500;
    res.status(code).json({ message: err.message });
  }
});

// GET /api/reports?contact=0771234567  -> the user's own reports
router.get('/', async (req, res) => {
  try {
    const contact = String(req.query.contact || '').trim();
    if (!contact) return res.status(400).json({ message: 'contact query param is required' });
    const reports = await Report.find({ contact }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
