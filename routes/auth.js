const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Rotas públicas
router.post('/login', authController.login);
router.post('/register', authController.register);

// Rotas protegidas
router.get('/profile', authMiddleware, authController.getProfile);

// Rotas admin
router.get('/users', authMiddleware, adminMiddleware, authController.getAllUsers);
router.put('/users/:id', authMiddleware, adminMiddleware, authController.updateUser);
router.delete('/users/:id', authMiddleware, adminMiddleware, authController.deleteUser);

module.exports = router;
