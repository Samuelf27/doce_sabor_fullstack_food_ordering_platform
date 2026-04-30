const db = require('../config/database');

const criarPedido = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { itens, endereco_entrega, observacoes, tipo_pagamento } = req.body;

    if (!itens?.length)
      return res.status(400).json({ erro: 'O pedido precisa ter pelo menos um item' });
    if (!endereco_entrega)
      return res.status(400).json({ erro: 'Endereço de entrega obrigatório' });

    let total = 0;
    const itensValidados = [];

    for (const item of itens) {
      const [prod] = await conn.query(
        'SELECT * FROM produtos WHERE id = ? AND disponivel = TRUE', [item.produto_id]
      );
      if (!prod.length) {
        await conn.rollback();
        return res.status(400).json({ erro: `Produto ${item.produto_id} indisponível` });
      }
      const subtotal = prod[0].preco * item.quantidade;
      total += subtotal;
      itensValidados.push({
        produto_id:    item.produto_id,
        nome_produto:  prod[0].nome,
        quantidade:    item.quantidade,
        preco_unitario: prod[0].preco,
        subtotal
      });
    }

    const [pedido] = await conn.query(
      'INSERT INTO pedidos (usuario_id, total, endereco_entrega, observacoes, tipo_pagamento) VALUES (?, ?, ?, ?, ?)',
      [req.usuario.id, total, endereco_entrega, observacoes || null, tipo_pagamento || 'pix']
    );

    for (const item of itensValidados) {
      await conn.query(
        'INSERT INTO pedido_itens (pedido_id, produto_id, nome_produto, quantidade, preco_unitario, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [pedido.insertId, item.produto_id, item.nome_produto, item.quantidade, item.preco_unitario, item.subtotal]
      );
    }

    await conn.commit();
    res.status(201).json({ mensagem: 'Pedido realizado com sucesso!', pedido_id: pedido.insertId, total });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar pedido' });
  } finally {
    conn.release();
  }
};

const meusPedidos = async (req, res) => {
  try {
    const [pedidos] = await db.query(
      'SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY criado_em DESC',
      [req.usuario.id]
    );
    for (const p of pedidos) {
      const [itens] = await db.query('SELECT * FROM pedido_itens WHERE pedido_id = ?', [p.id]);
      p.itens = itens;
    }
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar pedidos' });
  }
};

const detalhesPedido = async (req, res) => {
  try {
    const [pedidos] = await db.query(
      'SELECT * FROM pedidos WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.usuario.id]
    );
    if (!pedidos.length) return res.status(404).json({ erro: 'Pedido não encontrado' });
    const [itens] = await db.query('SELECT * FROM pedido_itens WHERE pedido_id = ?', [req.params.id]);
    pedidos[0].itens = itens;
    res.json(pedidos[0]);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar pedido' });
  }
};

module.exports = { criarPedido, meusPedidos, detalhesPedido };
