document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAdmin()) return;

  const page = window.location.pathname;
  if (page.includes('index'))   loadDashboard();
  if (page.includes('produto')) loadAdminProdutos();
  if (page.includes('pedido'))  loadAdminPedidos();
});

/* ─── Dashboard ─────────────────────────────── */
async function loadDashboard() {
  try {
    const d = await API.get('/admin/dashboard');
    document.getElementById('statPedidos')?.replaceChildren(Object.assign(document.createTextNode(d.total_pedidos), {}));
    setText('statPedidos',  d.total_pedidos);
    setText('statUsuarios', d.total_usuarios);
    setText('statProdutos', d.total_produtos);
    setText('statReceita',  formatCurrency(d.receita_total));

    const tbody = document.getElementById('recentOrdersTbody');
    if (tbody) {
      tbody.innerHTML = d.pedidos_recentes.map(p => {
        const st = statusMap(p.status);
        return `<tr>
          <td>#${p.id}</td>
          <td>${p.cliente_nome || '—'}</td>
          <td>${formatDate(p.criado_em)}</td>
          <td>${formatCurrency(p.total)}</td>
          <td><span class="badge ${st.cls}">${st.label}</span></td>
          <td>
            <select class="form-control" style="padding:4px 8px;font-size:.78rem;width:auto"
              onchange="updateStatus(${p.id},this.value)">
              ${statusOptions(p.status)}
            </select>
          </td>
        </tr>`;
      }).join('');
    }
  } catch (e) { showToast(e.message, 'error'); }
}

/* ─── Produtos Admin ────────────────────────── */
let categorias = [];
async function loadAdminProdutos() {
  try {
    categorias = await API.get('/produtos/categorias');
    const produtos = await API.get('/produtos/todos');
    const tbody = document.getElementById('produtosTbody');
    if (!tbody) return;
    tbody.innerHTML = produtos.map(p => `
      <tr>
        <td>${p.imagem_emoji || '🍨'}</td>
        <td><strong>${p.nome}</strong></td>
        <td>${p.categoria_nome || '—'}</td>
        <td>${formatCurrency(p.preco)}</td>
        <td><span class="badge ${p.disponivel ? 'badge-success' : 'badge-danger'}">${p.disponivel ? 'Disponível' : 'Indisponível'}</span></td>
        <td><span class="badge ${p.destaque ? 'badge-warning' : 'badge-gray'}">${p.destaque ? '⭐ Sim' : 'Não'}</span></td>
        <td>
          <button class="btn btn-sm btn-outline" onclick='openEditModal(${JSON.stringify(p)})'>✏️ Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deleteProduto(${p.id},'${p.nome.replace(/'/g,"\\'")}')">🗑️</button>
        </td>
      </tr>
    `).join('');
  } catch (e) { showToast(e.message, 'error'); }
}

function openCreateModal() {
  document.getElementById('modalTitle').textContent = 'Novo Produto';
  document.getElementById('produtoForm').reset();
  document.getElementById('produtoId').value = '';
  populateCatSelect(null);
  openModal('produtoModal');
}

function openEditModal(p) {
  document.getElementById('modalTitle').textContent = 'Editar Produto';
  document.getElementById('produtoId').value    = p.id;
  document.getElementById('pNome').value         = p.nome;
  document.getElementById('pDesc').value         = p.descricao || '';
  document.getElementById('pPreco').value        = p.preco;
  document.getElementById('pEmoji').value        = p.imagem_emoji || '🍨';
  document.getElementById('pDisponivel').checked = p.disponivel;
  document.getElementById('pDestaque').checked   = p.destaque;
  populateCatSelect(p.categoria_id);
  openModal('produtoModal');
}

function populateCatSelect(selectedId) {
  const sel = document.getElementById('pCategoria');
  if (!sel) return;
  sel.innerHTML = '<option value="">Sem categoria</option>' +
    categorias.map(c => `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${c.nome}</option>`).join('');
}

document.getElementById('produtoForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const id   = document.getElementById('produtoId').value;
  const body = {
    nome:        document.getElementById('pNome').value,
    descricao:   document.getElementById('pDesc').value,
    preco:       parseFloat(document.getElementById('pPreco').value),
    categoria_id:document.getElementById('pCategoria').value || null,
    imagem_emoji:document.getElementById('pEmoji').value,
    disponivel:  document.getElementById('pDisponivel').checked,
    destaque:    document.getElementById('pDestaque').checked
  };
  try {
    if (id) await API.put(`/produtos/${id}`, body);
    else    await API.post('/produtos', body);
    showToast(id ? 'Produto atualizado!' : 'Produto criado!', 'success');
    closeModal('produtoModal');
    loadAdminProdutos();
  } catch (err) { showToast(err.message, 'error'); }
});

async function deleteProduto(id, nome) {
  if (!confirm(`Deletar "${nome}"?`)) return;
  try { await API.delete(`/produtos/${id}`); showToast('Produto removido!', 'success'); loadAdminProdutos(); }
  catch (e) { showToast(e.message, 'error'); }
}

/* ─── Pedidos Admin ─────────────────────────── */
async function loadAdminPedidos() {
  const filter = document.getElementById('filterStatus')?.value || '';
  try {
    const pedidos = await API.get('/admin/pedidos' + (filter ? `?status=${filter}` : ''));
    const tbody   = document.getElementById('pedidosTbody');
    if (!tbody) return;
    tbody.innerHTML = pedidos.map(p => {
      const st = statusMap(p.status);
      return `<tr>
        <td>#${p.id}</td>
        <td>${p.cliente_nome || '—'}<br><small style="color:var(--gray)">${p.cliente_email || ''}</small></td>
        <td>${formatDate(p.criado_em)}</td>
        <td style="max-width:200px;font-size:.78rem">${p.endereco_entrega}</td>
        <td>${formatCurrency(p.total)}</td>
        <td><span class="badge ${st.cls}">${st.label}</span></td>
        <td>
          <select class="form-control" style="padding:4px 8px;font-size:.78rem;width:auto"
            onchange="updateStatus(${p.id},this.value)">
            ${statusOptions(p.status)}
          </select>
        </td>
      </tr>`;
    }).join('');
  } catch (e) { showToast(e.message, 'error'); }
}

async function updateStatus(id, status) {
  try {
    await API.put(`/admin/pedidos/${id}/status`, { status });
    showToast('Status atualizado!', 'success');
  } catch (e) { showToast(e.message, 'error'); }
}

/* ─── Helpers ───────────────────────────────── */
const STATUS = {
  pendente:     { label:'Pendente',         cls:'badge-warning' },
  confirmado:   { label:'Confirmado',       cls:'badge-info' },
  preparando:   { label:'Preparando',       cls:'badge-primary' },
  saiu_entrega: { label:'Saiu p/ Entrega',  cls:'badge-info' },
  entregue:     { label:'Entregue',         cls:'badge-success' },
  cancelado:    { label:'Cancelado',        cls:'badge-danger' }
};
const statusMap = s => STATUS[s] || { label:s, cls:'badge-gray' };
const statusOptions = selected => Object.entries(STATUS).map(([v, {label}]) =>
  `<option value="${v}" ${v === selected ? 'selected' : ''}>${label}</option>`
).join('');

function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function openModal(id)  { document.getElementById(id)?.classList.add('active'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }
