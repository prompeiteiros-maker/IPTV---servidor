const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/database');
const config = require('../config/config');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    const user = await db.get('SELECT * FROM users WHERE username = ? AND active = 1', [username]);

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Atualizar último login
    await db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    const existingUser = await db.get('SELECT * FROM users WHERE username = ?', [username]);

    if (existingUser) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.run(
      'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
      [username, hashedPassword, email]
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      userId: result.id
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await db.get(
      'SELECT id, username, email, role, created_at, last_login FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await db.query(
      'SELECT id, username, email, role, created_at, last_login, active FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role, active } = req.body;

    await db.run(
      'UPDATE users SET email = ?, role = ?, active = ? WHERE id = ?',
      [email, role, active, id]
    );

    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Não permitir deletar o próprio usuário
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Não é possível deletar seu próprio usuário' });
    }

    await db.run('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
};

module.exports = {
  login,
  register,
  getProfile,
  getAllUsers,
  updateUser,
  deleteUser
};
