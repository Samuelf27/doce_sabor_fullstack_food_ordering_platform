const db = require('../config/database');

const dashboard = async (req, res) => {
  try {
    const [[{ total_pedidos }]]  = await db.query('SELECT COUNT(*) AS total_pedidos FROM pedidos');
    const [[{ total_usuarios }]] = await db.query('SELECT COUNT(*) AS total_usuarios FROM usuarios WHERE role = "cliente"');
    const [[{ total_produtos }]] = await db.query('SELECT COUNT(*) AS total_produtos FROM produtos WHERE disponivel = TRUE');
    const [[{ receita_total }]]  = await db.query('SELECT COALESCE(SUM(total),0) AS receita_total FROM pedidos WHERE status != "cancelado"');
    const [pedidos_recentes]     = await db.query(`
      SELECT p.*, u.nome AS cliente_nome
      FROM pedidos p LEFT JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.criado_em DESC LIMIT 10
    `);
    res.json({ total_pedidos, total_usuarios, total_produtos, receita_total, pedidos_recentes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao carregar dashboard' });
  }
};

const listarPedidosAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT p.*, u.nome AS cliente_nome, u.email AS cliente_email
      FROM pedidos p LEFT JOIN usuarios u ON p.usuario_id = u.id
    `;
    const params = [];
    if (status) { sql += ' WHERE p.status = ?'; params.push(status); }
    sql += ' ORDER BY p.criado_em DESC';
    const [pedidos] = await db.query(sql, params);
    for (const p of pedidos) {
      const [itens] = await db.query('SELECT * FROM pedido_itens WHERE pedido_id = ?', [p.id]);
      p.itens = itens;
    }
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar pedidos' });
  }
};

const atualizarStatusPedido = async (req, res) => {
  try {
    const validos = ['pendente','confirmado','preparando','saiu_entrega','entregue','cancelado'];
    if (!validos.includes(req.body.status))
      return res.status(400).json({ erro: 'Status inválido' });
    await db.query('UPDATE pedidos SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
    res.json({ mensagem: 'Status atualizado!' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar status' });
  }
};

const listarUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nome, email, telefone, role, ativo, criado_em FROM usuarios ORDER BY criado_em DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar usuários' });
  }
};

module.exports = { dashboard, listarPedidosAdmin, atualizarStatusPedido, listarUsuarios };
