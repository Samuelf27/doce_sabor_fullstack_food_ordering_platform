const router = require('express').Router();
const db     = require('../config/database');

router.post('/validar', async (req, res) => {
  const { codigo, subtotal } = req.body;
  if (!codigo) return res.status(400).json({ erro: 'Código não informado.' });

  try {
    const [rows] = await db.query(
      `SELECT * FROM cupons
       WHERE codigo = ? AND ativo = TRUE
         AND (validade IS NULL OR validade >= CURDATE())
         AND (uso_maximo IS NULL OR uso_atual < uso_maximo)`,
      [codigo.trim().toUpperCase()]
    );

    if (!rows.length) return res.status(404).json({ erro: 'Cupom inválido ou expirado.' });

    const cupom   = rows[0];
    const sub     = parseFloat(subtotal) || 0;
    const desconto = cupom.tipo === 'percentual'
      ? parseFloat((sub * cupom.valor / 100).toFixed(2))
      : parseFloat(cupom.valor);

    res.json({
      codigo:   cupom.codigo,
      tipo:     cupom.tipo,
      valor:    cupom.valor,
      desconto: Math.min(desconto, sub)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao validar cupom.' });
  }
});

module.exports = router;
