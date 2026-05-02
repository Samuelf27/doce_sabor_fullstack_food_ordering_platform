const db = require('../config/database');

const listarProdutos = async (req, res) => {
  try {
    const { categoria, destaque } = req.query;
    let sql = `
      SELECT p.*, c.nome AS categoria_nome, c.icone AS categoria_icone,
             ROUND(AVG(a.estrelas), 1) AS media_estrelas,
             COUNT(a.id)              AS total_avaliacoes
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN avaliacoes a ON a.produto_id = p.id
      WHERE p.disponivel = TRUE
    `;
    const params = [];
    if (categoria) { sql += ' AND p.categoria_id = ?'; params.push(categoria); }
    if (destaque === 'true') { sql += ' AND p.destaque = TRUE'; }
    sql += ' GROUP BY p.id ORDER BY p.destaque DESC, p.nome ASC';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar produtos' });
  }
};

const listarTodos = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.nome AS categoria_nome
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar produtos' });
  }
};

const buscarProduto = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT p.*, c.nome AS categoria_nome FROM produtos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar produto' });
  }
};

const listarCategorias = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categorias WHERE ativo = TRUE ORDER BY nome');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar categorias' });
  }
};

const criarProduto = async (req, res) => {
  try {
    const { nome, descricao, preco, categoria_id, imagem_emoji, disponivel, destaque } = req.body;
    if (!nome || !preco) return res.status(400).json({ erro: 'Nome e preço são obrigatórios' });
    const [r] = await db.query(
      'INSERT INTO produtos (nome, descricao, preco, categoria_id, imagem_emoji, disponivel, destaque) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nome, descricao, preco, categoria_id || null, imagem_emoji || '🍨', disponivel !== false, destaque || false]
    );
    res.status(201).json({ mensagem: 'Produto criado!', id: r.insertId });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao criar produto' });
  }
};

const atualizarProduto = async (req, res) => {
  try {
    const { nome, descricao, preco, categoria_id, imagem_emoji, disponivel, destaque } = req.body;
    await db.query(
      'UPDATE produtos SET nome=?, descricao=?, preco=?, categoria_id=?, imagem_emoji=?, disponivel=?, destaque=? WHERE id=?',
      [nome, descricao, preco, categoria_id, imagem_emoji, disponivel, destaque, req.params.id]
    );
    res.json({ mensagem: 'Produto atualizado!' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar produto' });
  }
};

const deletarProduto = async (req, res) => {
  try {
    await db.query('DELETE FROM produtos WHERE id = ?', [req.params.id]);
    res.json({ mensagem: 'Produto removido!' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao deletar produto' });
  }
};

module.exports = { listarProdutos, listarTodos, buscarProduto, listarCategorias, criarProduto, atualizarProduto, deletarProduto };
