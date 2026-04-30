const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/database');

const registrar = async (req, res) => {
  try {
    const { nome, email, senha, telefone } = req.body;
    if (!nome || !email || !senha)
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });

    const [existe] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existe.length)
      return res.status(409).json({ erro: 'Este email já está cadastrado' });

    const hash = await bcrypt.hash(senha, 10);
    const [r] = await db.query(
      'INSERT INTO usuarios (nome, email, senha, telefone) VALUES (?, ?, ?, ?)',
      [nome, email, hash, telefone || null]
    );

    const token = jwt.sign(
      { id: r.insertId, email, role: 'cliente' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    res.status(201).json({
      mensagem: 'Cadastro realizado com sucesso!',
      token,
      usuario: { id: r.insertId, nome, email, role: 'cliente' }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha)
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });

    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE email = ? AND ativo = TRUE', [email]
    );
    if (!rows.length || !(await bcrypt.compare(senha, rows[0].senha)))
      return res.status(401).json({ erro: 'Email ou senha incorretos' });

    const u = rows[0];
    const token = jwt.sign(
      { id: u.id, email: u.email, role: u.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    res.json({
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: { id: u.id, nome: u.nome, email: u.email, role: u.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

const perfil = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nome, email, telefone, endereco, role, criado_em FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );
    if (!rows.length) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

const atualizarPerfil = async (req, res) => {
  try {
    const { nome, telefone, endereco } = req.body;
    await db.query(
      'UPDATE usuarios SET nome = ?, telefone = ?, endereco = ? WHERE id = ?',
      [nome, telefone, endereco, req.usuario.id]
    );
    res.json({ mensagem: 'Perfil atualizado!' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

module.exports = { registrar, login, perfil, atualizarPerfil };
