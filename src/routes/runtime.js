const express = require('express');
const { runtimeAuth } = require('../middleware/runtimeAuth');
const { runtimeLimiter } = require('../middleware/rateLimiter');
const {
  runtimeLogger,
  createDocument,
  listDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
} = require('../controllers/runtimeController');

const router = express.Router();

// All runtime routes require API key authentication and rate limiting
router.use(runtimeLimiter);
router.use(runtimeAuth);
router.use(runtimeLogger);

// Verify that projectId from URL matches the API key's project
router.use('/:projectId/:collectionSlug', (req, res, next) => {
  if (req.project._id.toString() !== req.params.projectId) {
    return res.status(403).json({
      success: false,
      error: { message: 'API key does not match the requested project.' },
    });
  }
  next();
});

// Generic CRUD routes
router.post('/:projectId/:collectionSlug', createDocument);
router.get('/:projectId/:collectionSlug', listDocuments);
router.get('/:projectId/:collectionSlug/:documentId', getDocument);
router.patch('/:projectId/:collectionSlug/:documentId', updateDocument);
router.delete('/:projectId/:collectionSlug/:documentId', deleteDocument);

module.exports = router;
