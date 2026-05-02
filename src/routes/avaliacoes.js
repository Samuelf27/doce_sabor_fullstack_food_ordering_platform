const router = require('express').Router();
const db     = require('../config/database');
const { verificarToken } = require('../middleware/authMiddleware');

// GET — avaliações de um produto
router.get('/produto/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.estrelas, a.comentario, a.criado_em,
             u.nome AS usuario_nome
      FROM avaliacoes a
      JOIN usuarios u ON u.id = a.usuario_id
      WHERE a.produto_id = ?
      ORDER BY a.criado_em DESC
      LIMIT 20
    `, [req.params.id]);

    const [[stats]] = await db.query(`
      SELECT ROUND(AVG(estrelas), 1) AS media, COUNT(*) AS total
      FROM avaliacoes WHERE produto_id = ?
    `, [req.params.id]);

    res.json({
      avaliacoes: rows,
      media: parseFloat(stats.media) || 0,
      total: parseInt(stats.total) || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar avaliações.' });
  }
});

// POST — criar ou atualizar avaliação
router.post('/', verificarToken, async (req, res) => {
  const { produto_id, estrelas, comentario } = req.body;

  if (!produto_id || !estrelas || estrelas < 1 || estrelas > 5) {
    return res.status(400).json({ erro: 'Produto e estrelas (1–5) são obrigatórios.' });
  }

  try {
    await db.query(`
      INSERT INTO avaliacoes (produto_id, usuario_id, estrelas, comentario)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        estrelas   = VALUES(estrelas),
        comentario = VALUES(comentario),
        criado_em  = NOW()
    `, [produto_id, req.usuario.id, estrelas, comentario?.trim() || null]);

    res.json({ mensagem: 'Avaliação enviada com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao salvar avaliação.' });
  }
});

module.exports = router;
