const router = require('express').Router();
const db     = require('../config/database');
const { dashboard, listarPedidosAdmin, atualizarStatusPedido, listarUsuarios } = require('../controllers/adminController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

router.use(verificarToken, verificarAdmin);

router.get('/dashboard',              dashboard);
router.get('/pedidos',                listarPedidosAdmin);
router.put('/pedidos/:id/status',     atualizarStatusPedido);
router.get('/usuarios',               listarUsuarios);

/* ── Cupons admin ──────────────────────────────────────── */

router.get('/cupons', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM cupons ORDER BY criado_em DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ erro: 'Erro ao buscar cupons.' }); }
});

router.post('/cupons', async (req, res) => {
  const { codigo, tipo, valor, validade, uso_maximo } = req.body;
  if (!codigo || !tipo || !valor)
    return res.status(400).json({ erro: 'Código, tipo e valor são obrigatórios.' });
  try {
    const [r] = await db.query(
      'INSERT INTO cupons (codigo, tipo, valor, validade, uso_maximo) VALUES (?, ?, ?, ?, ?)',
      [codigo.trim().toUpperCase(), tipo, valor, validade || null, uso_maximo || null]
    );
    res.status(201).json({ mensagem: 'Cupom criado!', id: r.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'Código já existe.' });
    res.status(500).json({ erro: 'Erro ao criar cupom.' });
  }
});

router.put('/cupons/:id', async (req, res) => {
  const { codigo, tipo, valor, validade, uso_maximo, ativo } = req.body;
  try {
    await db.query(
      'UPDATE cupons SET codigo=?, tipo=?, valor=?, validade=?, uso_maximo=?, ativo=? WHERE id=?',
      [codigo.trim().toUpperCase(), tipo, valor, validade || null, uso_maximo || null, ativo !== false, req.params.id]
    );
    res.json({ mensagem: 'Cupom atualizado!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ erro: 'Código já existe.' });
    res.status(500).json({ erro: 'Erro ao atualizar cupom.' });
  }
});

router.patch('/cupons/:id/toggle', async (req, res) => {
  try {
    await db.query('UPDATE cupons SET ativo = NOT ativo WHERE id = ?', [req.params.id]);
    res.json({ mensagem: 'Status do cupom alterado!' });
  } catch (err) { res.status(500).json({ erro: 'Erro ao alterar cupom.' }); }
});

router.delete('/cupons/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM cupons WHERE id = ?', [req.params.id]);
    res.json({ mensagem: 'Cupom removido!' });
  } catch (err) { res.status(500).json({ erro: 'Erro ao deletar cupom.' }); }
});

module.exports = router;
