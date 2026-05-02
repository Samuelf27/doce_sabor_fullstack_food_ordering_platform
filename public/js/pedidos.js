const STATUS_CONFIG = {
  pendente:     { label:'Pendente',         cls:'badge-warning', step:0, icon:'⏳' },
  confirmado:   { label:'Confirmado',       cls:'badge-info',    step:1, icon:'✅' },
  preparando:   { label:'Preparando',       cls:'badge-primary', step:2, icon:'👨‍🍳' },
  saiu_entrega: { label:'Saiu p/ Entrega',  cls:'badge-info',    step:3, icon:'🛵' },
  entregue:     { label:'Entregue',         cls:'badge-success', step:4, icon:'🎉' },
  cancelado:    { label:'Cancelado',        cls:'badge-danger',  step:-1, icon:'❌' }
};

const TIMELINE_STEPS = [
  { key:'confirmado',   label:'Confirmado',      icon:'✅' },
  { key:'preparando',   label:'Preparando',      icon:'👨‍🍳' },
  { key:'saiu_entrega', label:'Saiu p/ Entrega', icon:'🛵' },
  { key:'entregue',     label:'Entregue',        icon:'🎉' }
];

let pollingInterval = null;
let pedidosCache    = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireLogin()) return;
  const user = Auth.getUser();
  if (user?.nome) {
    const el = document.getElementById('userName');
    if (el) el.textContent = user.nome.split(' ')[0];
  }
  await fetchPedidos();
  startPolling();
});

async function fetchPedidos(silent = false) {
  const list = document.getElementById('pedidosList');
  if (!list) return;

  if (!silent) list.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const pedidos = await API.get('/pedidos/meus');

    const hasChanges = JSON.stringify(pedidos.map(p => p.status)) !== JSON.stringify(pedidosCache.map(p => p.status));
    if (silent && !hasChanges) return;

    pedidosCache = pedidos;

    if (!pedidos.length) {
      stopPolling();
      list.innerHTML = `
        <div style="text-align:center;padding:80px 24px">
          <div style="font-size:3.5rem;margin-bottom:16px">📦</div>
          <h3>Nenhum pedido ainda</h3>
          <p style="color:var(--gray);margin:8px 0 24px">Faça seu primeiro pedido!</p>
          <a href="/" class="btn btn-primary">Ver Cardápio</a>
        </div>`;
      return;
    }

    list.innerHTML = pedidos.map(p => pedidoCard(p)).join('');

    const allDone = pedidos.every(p => p.status === 'entregue' || p.status === 'cancelado');
    if (allDone) stopPolling();

  } catch (err) {
    if (!silent) list.innerHTML = `<p style="text-align:center;color:var(--danger);padding:40px">${err.message}</p>`;
  }
}

function pedidoCard(p) {
  const st = STATUS_CONFIG[p.status] || { label: p.status, cls: 'badge-gray', icon: '📦' };
  const showTimeline = p.status !== 'cancelado';

  return `
    <div class="pedido-card" id="pedido-${p.id}">
      <div class="pedido-card-header">
        <div>
          <div class="pedido-id">Pedido #${p.id}</div>
          <div class="pedido-data">${formatDate(p.criado_em)}</div>
        </div>
        <span class="badge ${st.cls}">${st.icon} ${st.label}</span>
      </div>

      ${showTimeline ? renderTimeline(p.status) : '<div style="padding:8px 0;color:var(--danger);font-size:.85rem">❌ Pedido cancelado</div>'}

      <div class="pedido-itens" style="margin-top:14px">
        ${p.itens.map(i => `
          <div class="pedido-item">
            <span>${i.quantidade}× ${i.nome_produto}</span>
            <span>${formatCurrency(i.subtotal)}</span>
          </div>`).join('')}
      </div>
      <div class="pedido-total">Total: ${formatCurrency(p.total)}</div>
    </div>`;
}

function renderTimeline(status) {
  const currentStep = STATUS_CONFIG[status]?.step ?? 0;
  return `
    <div class="status-timeline">
      ${TIMELINE_STEPS.map((s, i) => {
        const step    = i + 1;
        const done    = currentStep >= step;
        const active  = currentStep === step;
        return `
          <div class="timeline-step ${done ? 'done' : ''} ${active ? 'active' : ''}">
            <div class="timeline-icon">${done ? s.icon : (i + 1)}</div>
            <div class="timeline-label">${s.label}</div>
          </div>
          ${i < TIMELINE_STEPS.length - 1 ? `<div class="timeline-connector ${done ? 'done' : ''}"></div>` : ''}`;
      }).join('')}
    </div>`;
}

function startPolling() {
  if (pollingInterval) return;
  pollingInterval = setInterval(() => fetchPedidos(true), 30000);
}

function stopPolling() {
  if (pollingInterval) { clearInterval(pollingInterval); pollingInterval = null; }
}
