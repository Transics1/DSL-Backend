const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { getAllApplications, exportCSV, generateApplicationPDF } = require('../controllers/adminController');
const router = express.Router();

router.get('/applications', authMiddleware, adminMiddleware, getAllApplications);
router.get('/export', authMiddleware, adminMiddleware, exportCSV);
router.get('/application/pdf/:id', authMiddleware, adminMiddleware, generateApplicationPDF);

module.exports = router;