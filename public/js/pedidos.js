const statusLabel = {
  pendente:      { label:'Pendente',      cls:'badge-warning' },
  confirmado:    { label:'Confirmado',    cls:'badge-info' },
  preparando:    { label:'Preparando',    cls:'badge-primary' },
  saiu_entrega:  { label:'Saiu p/ Entrega', cls:'badge-info' },
  entregue:      { label:'Entregue',      cls:'badge-success' },
  cancelado:     { label:'Cancelado',     cls:'badge-danger' }
};

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireLogin()) return;
  const list = document.getElementById('pedidosList');
  list.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  try {
    const pedidos = await API.get('/pedidos/meus');
    if (!pedidos.length) {
      list.innerHTML = `
        <div style="text-align:center;padding:80px 24px">
          <div style="font-size:3.5rem;margin-bottom:16px">📦</div>
          <h3>Nenhum pedido ainda</h3>
          <p style="color:var(--gray);margin:8px 0 24px">Faça seu primeiro pedido!</p>
          <a href="/cardapio.html" class="btn btn-primary">Ver Cardápio</a>
        </div>`;
      return;
    }
    list.innerHTML = pedidos.map(p => {
      const st = statusLabel[p.status] || { label:p.status, cls:'badge-gray' };
      return `
        <div class="pedido-card">
          <div class="pedido-card-header">
            <div>
              <div class="pedido-id">Pedido #${p.id}</div>
              <div class="pedido-data">${formatDate(p.criado_em)}</div>
            </div>
            <span class="badge ${st.cls}">${st.label}</span>
          </div>
          <div class="pedido-itens">
            ${p.itens.map(i => `
              <div class="pedido-item">
                <span>${i.quantidade}× ${i.nome_produto}</span>
                <span>${formatCurrency(i.subtotal)}</span>
              </div>
            `).join('')}
          </div>
          <div class="pedido-total">Total: ${formatCurrency(p.total)}</div>
        </div>`;
    }).join('');
  } catch (err) {
    list.innerHTML = `<p style="text-align:center;color:var(--danger);padding:40px">${err.message}</p>`;
  }
});
