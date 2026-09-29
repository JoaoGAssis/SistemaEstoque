const STORAGE_KEYS = {
  products: 'estoque_products',
  purchases: 'estoque_purchases',
  stockEntries: 'estoque_stock_entries',
  sales: 'estoque_sales',
  rememberUser: 'estoque_remember_user'
};

const defaultData = {
  products: [
    { id: crypto.randomUUID(), codigo: 'P001', nome: 'Notebook', quantidade: 5, valor: 2500.00 },
    { id: crypto.randomUUID(), codigo: 'P002', nome: 'Mouse', quantidade: 25, valor: 50.00 },
    { id: crypto.randomUUID(), codigo: 'P003', nome: 'Teclado', quantidade: 12, valor: 150.00 },
    { id: crypto.randomUUID(), codigo: 'P004', nome: 'Monitor', quantidade: 8, valor: 800.00 },
    { id: crypto.randomUUID(), codigo: 'P005', nome: 'Webcam', quantidade: 15, valor: 200.00 }
  ],
  purchases: [
    { id: crypto.randomUUID(), data: '2025-11-01', fornecedor: 'Fornecedor A', valor: 1500.00, situacao: 'Recebida', nfe: 'NF123' },
    { id: crypto.randomUUID(), data: '2025-11-05', fornecedor: 'Fornecedor B', valor: 300.50, situacao: 'Pendente', nfe: 'NF124' }
  ],
  stockEntries: [
    { id: crypto.randomUUID(), data: '2025-11-02', codigo: 'P001', nome: 'Notebook', quantidade: 2 },
    { id: crypto.randomUUID(), data: '2025-11-03', codigo: 'P003', nome: 'Teclado', quantidade: 5 }
  ],
  sales: [
    { id: crypto.randomUUID(), data: '2025-11-06', cliente: 'Maria Souza', codigo: 'P002', nome: 'Mouse', quantidade: 3, valor: 50.00 },
    { id: crypto.randomUUID(), data: '2025-11-07', cliente: 'João Lima', codigo: 'P005', nome: 'Webcam', quantidade: 2, valor: 200.00 }
  ]
};

const state = {
  activeTab: 'produtos',
  editingType: null,
  editingId: null,
  products: loadStorage(STORAGE_KEYS.products, defaultData.products),
  purchases: loadStorage(STORAGE_KEYS.purchases, defaultData.purchases),
  stockEntries: loadStorage(STORAGE_KEYS.stockEntries, defaultData.stockEntries),
  sales: loadStorage(STORAGE_KEYS.sales, defaultData.sales)
};

const refs = {
  loginView: document.getElementById('loginView'),
  dashboardView: document.getElementById('dashboardView'),
  loginForm: document.getElementById('loginForm'),
  usuario: document.getElementById('usuario'),
  senha: document.getElementById('senha'),
  lembrar: document.getElementById('lembrar'),
  togglePassword: document.getElementById('togglePassword'),
  forgotPassword: document.getElementById('forgotPassword'),
  currentUser: document.getElementById('currentUser'),
  logoutBtn: document.getElementById('logoutBtn'),
  heroTitle: document.getElementById('heroTitle'),
  heroSubtitle: document.getElementById('heroSubtitle'),
  statProdutos: document.getElementById('statProdutos'),
  statCompras: document.getElementById('statCompras'),
  statEstoque: document.getElementById('statEstoque'),
  statVendas: document.getElementById('statVendas'),
  tabButtons: [...document.querySelectorAll('.tab-button')],
  tabPanels: [...document.querySelectorAll('.tab-panel')],
  searchProdutos: document.getElementById('searchProdutos'),
  searchCompras: document.getElementById('searchCompras'),
  searchEstoque: document.getElementById('searchEstoque'),
  searchVendas: document.getElementById('searchVendas'),
  reportPeriod: document.getElementById('reportPeriod'),
  produtosTableBody: document.getElementById('produtosTableBody'),
  comprasTableBody: document.getElementById('comprasTableBody'),
  estoqueTableBody: document.getElementById('estoqueTableBody'),
  vendasTableBody: document.getElementById('vendasTableBody'),
  relatorioTableBody: document.getElementById('relatorioTableBody'),
  reportTotalVendas: document.getElementById('reportTotalVendas'),
  reportQtdVendida: document.getElementById('reportQtdVendida'),
  reportTicketMedio: document.getElementById('reportTicketMedio'),
  reportProdutoMaisVendido: document.getElementById('reportProdutoMaisVendido'),
  salesChart: document.getElementById('salesChart'),
  addProdutoBtn: document.getElementById('addProdutoBtn'),
  addCompraBtn: document.getElementById('addCompraBtn'),
  addEstoqueBtn: document.getElementById('addEstoqueBtn'),
  addVendasBtn: document.getElementById('addVendasBtn'),
  modalOverlay: document.getElementById('modalOverlay'),
  modalTitle: document.getElementById('modalTitle'),
  modalForm: document.getElementById('modalForm'),
  closeModalBtn: document.getElementById('closeModalBtn')
};

function loadStorage(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return structuredClone(fallback);
  try {
    return JSON.parse(raw);
  } catch {
    return structuredClone(fallback);
  }
}

function saveStorage() {
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(state.products));
  localStorage.setItem(STORAGE_KEYS.purchases, JSON.stringify(state.purchases));
  localStorage.setItem(STORAGE_KEYS.stockEntries, JSON.stringify(state.stockEntries));
  localStorage.setItem(STORAGE_KEYS.sales, JSON.stringify(state.sales));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
}

function setup() {
  const rememberedUser = localStorage.getItem(STORAGE_KEYS.rememberUser);
  if (rememberedUser) {
    refs.usuario.value = rememberedUser;
    refs.lembrar.checked = true;
  }

  refs.loginForm.addEventListener('submit', handleLogin);
  refs.togglePassword.addEventListener('click', togglePasswordVisibility);
  refs.forgotPassword.addEventListener('click', () => showToast('Na demonstração, basta usar qualquer usuário e senha.'));
  refs.logoutBtn.addEventListener('click', logout);
  refs.closeModalBtn.addEventListener('click', closeModal);
  refs.modalOverlay.addEventListener('click', (event) => {
    if (event.target === refs.modalOverlay) closeModal();
  });

  refs.tabButtons.forEach((button) => {
    button.addEventListener('click', () => switchTab(button.dataset.tab));
  });

  refs.addProdutoBtn.addEventListener('click', () => openModal('produto'));
  refs.addCompraBtn.addEventListener('click', () => openModal('compra'));
  refs.addEstoqueBtn.addEventListener('click', () => openModal('estoque'));
  refs.addVendasBtn.addEventListener('click', () => openModal('venda'));

  refs.searchProdutos.addEventListener('input', renderProducts);
  refs.searchCompras.addEventListener('input', renderPurchases);
  refs.searchEstoque.addEventListener('input', renderStockEntries);
  refs.searchVendas.addEventListener('input', renderSales);
  refs.reportPeriod.addEventListener('change', renderSalesReport);

  document.addEventListener('click', handleTableActions);

  updateStats();
  renderProducts();
  renderPurchases();
  renderStockEntries();
  renderSales();
  renderSalesReport();
}

function handleLogin(event) {
  event.preventDefault();
  const user = refs.usuario.value.trim() || 'Mirim';

  if (refs.lembrar.checked) {
    localStorage.setItem(STORAGE_KEYS.rememberUser, user);
  } else {
    localStorage.removeItem(STORAGE_KEYS.rememberUser);
  }

  refs.currentUser.textContent = user;
  refs.loginView.classList.remove('active');
  refs.dashboardView.classList.add('active');
  showToast(`Bem-vindo, ${user}.`);
}

function logout() {
  refs.dashboardView.classList.remove('active');
  refs.loginView.classList.add('active');
  refs.loginForm.reset();

  const rememberedUser = localStorage.getItem(STORAGE_KEYS.rememberUser);
  if (rememberedUser) {
    refs.usuario.value = rememberedUser;
    refs.lembrar.checked = true;
  }
}

function togglePasswordVisibility() {
  const isPassword = refs.senha.getAttribute('type') === 'password';
  refs.senha.setAttribute('type', isPassword ? 'text' : 'password');
  refs.togglePassword.textContent = isPassword ? '🙈' : '👁';
}

function switchTab(tab) {
  state.activeTab = tab;

  const titles = {
    produtos: {
      title: 'Produtos',
      subtitle: 'Gerencie os itens cadastrados, valores e quantidades do estoque.'
    },
    compras: {
      title: 'Compras',
      subtitle: 'Acompanhe fornecedores, notas fiscais e situação de recebimento.'
    },
    estoque: {
      title: 'Estoque - Entradas',
      subtitle: 'Registre movimentações e acompanhe as entradas de mercadorias.'
    },
    vendas: {
      title: 'Vendas',
      subtitle: 'Acompanhe as operações de venda e o impacto no estoque.'
    },
    relatorio: {
      title: 'Relatório de Vendas',
      subtitle: 'Analise faturamento, ticket médio e desempenho por período.'
    }
  };

  refs.heroTitle.textContent = titles[tab].title;
  refs.heroSubtitle.textContent = titles[tab].subtitle;

  refs.tabButtons.forEach((button) => button.classList.toggle('active', button.dataset.tab === tab));
  refs.tabPanels.forEach((panel) => panel.classList.toggle('active', panel.id === `tab-${tab}`));
}

function updateStats() {
  refs.statProdutos.textContent = state.products.length;
  refs.statCompras.textContent = state.purchases.length;
  refs.statEstoque.textContent = state.stockEntries.length;
  refs.statVendas.textContent = state.sales.length;
}

function renderProducts() {
  const term = refs.searchProdutos.value.trim().toLowerCase();
  const filtered = state.products.filter((item) =>
    [item.codigo, item.nome, String(item.quantidade), String(item.valor)].some((value) =>
      String(value).toLowerCase().includes(term)
    )
  );

  refs.produtosTableBody.innerHTML = filtered.length
    ? filtered.map((item) => `
      <tr>
        <td>${item.codigo}</td>
        <td>${item.nome}</td>
        <td>${item.quantidade}</td>
        <td>${formatCurrency(item.valor)}</td>
        <td>
          <div class="actions-row">
            <button class="btn btn-warning btn-small" data-action="edit" data-type="produto" data-id="${item.id}">✏ Editar</button>
            <button class="btn btn-danger btn-small" data-action="delete" data-type="produto" data-id="${item.id}">🗑 Deletar</button>
          </div>
        </td>
      </tr>
    `).join('')
    : emptyRow(5);
}

function renderPurchases() {
  const term = refs.searchCompras.value.trim().toLowerCase();
  const filtered = state.purchases.filter((item) =>
    [item.data, item.fornecedor, item.situacao, item.nfe, item.valor].some((value) =>
      String(value).toLowerCase().includes(term)
    )
  );

  refs.comprasTableBody.innerHTML = filtered.length
    ? filtered.map((item) => `
      <tr>
        <td>${item.data}</td>
        <td>${item.fornecedor}</td>
        <td>${formatCurrency(item.valor)}</td>
        <td><span class="status-badge ${item.situacao.toLowerCase()}">${item.situacao}</span></td>
        <td>${item.nfe}</td>
        <td>
          <div class="actions-row">
            <button class="btn btn-warning btn-small" data-action="edit" data-type="compra" data-id="${item.id}">✏ Editar</button>
            <button class="btn btn-danger btn-small" data-action="delete" data-type="compra" data-id="${item.id}">🗑 Deletar</button>
          </div>
        </td>
      </tr>
    `).join('')
    : emptyRow(6);
}

function renderStockEntries() {
  const term = refs.searchEstoque.value.trim().toLowerCase();
  const filtered = state.stockEntries.filter((item) =>
    [item.data, item.codigo, item.nome, item.quantidade].some((value) =>
      String(value).toLowerCase().includes(term)
    )
  );

  refs.estoqueTableBody.innerHTML = filtered.length
    ? filtered.map((item) => `
      <tr>
        <td>${item.data}</td>
        <td>${item.codigo}</td>
        <td>${item.nome}</td>
        <td>${item.quantidade}</td>
        <td>
          <div class="actions-row">
            <button class="btn btn-warning btn-small" data-action="edit" data-type="estoque" data-id="${item.id}">✏ Editar</button>
            <button class="btn btn-danger btn-small" data-action="delete" data-type="estoque" data-id="${item.id}">🗑 Deletar</button>
          </div>
        </td>
      </tr>
    `).join('')
    : emptyRow(5);
}

function renderSales() {
  const term = refs.searchVendas.value.trim().toLowerCase();
  const filtered = state.sales.filter((item) =>
    [item.data, item.cliente, item.codigo, item.nome, item.quantidade, String(item.valor)].some((value) =>
      String(value).toLowerCase().includes(term)
    )
  );

  refs.vendasTableBody.innerHTML = filtered.length
    ? filtered.map((item) => {
        const valorTotal = Number(item.valor || 0) * Number(item.quantidade || 0);
        return `
          <tr>
            <td>${item.data}</td>
            <td>${item.cliente}</td>
            <td>${item.nome} (${item.codigo})</td>
            <td>${item.quantidade}</td>
            <td>${formatCurrency(valorTotal)}</td>
            <td>
              <div class="actions-row">
                <button class="btn btn-warning btn-small" data-action="edit" data-type="venda" data-id="${item.id}">✏ Editar</button>
                <button class="btn btn-danger btn-small" data-action="delete" data-type="venda" data-id="${item.id}">🗑 Deletar</button>
              </div>
            </td>
          </tr>
        `;
      }).join('')
    : emptyRow(6);
}

function renderSalesReport() {
  const period = refs.reportPeriod.value;
  const today = new Date();
  const sales = [...state.sales].filter((item) => {
    if (!item.data) return true;
    if (period === 'all') return true;

    const saleDate = new Date(`${item.data}T00:00:00`);
    const diffDays = Math.floor((today - saleDate) / (1000 * 60 * 60 * 24));
    return diffDays <= Number(period) && diffDays >= 0;
  });

  const totalFaturamento = sales.reduce((accumulator, item) => {
    return accumulator + Number(item.valor || 0) * Number(item.quantidade || 0);
  }, 0);

  const totalQuantidade = sales.reduce((accumulator, item) => accumulator + Number(item.quantidade || 0), 0);
  const ticketMedio = sales.length ? totalFaturamento / sales.length : 0;

  const resumoProdutos = sales.reduce((accumulator, item) => {
    const key = item.nome || 'Produto';
    accumulator[key] = (accumulator[key] || 0) + Number(item.quantidade || 0);
    return accumulator;
  }, {});

  const produtoMaisVendido = Object.entries(resumoProdutos).sort((a, b) => b[1] - a[1])[0];

  refs.reportTotalVendas.textContent = formatCurrency(totalFaturamento);
  refs.reportQtdVendida.textContent = String(totalQuantidade);
  refs.reportTicketMedio.textContent = formatCurrency(ticketMedio);
  refs.reportProdutoMaisVendido.textContent = produtoMaisVendido ? `${produtoMaisVendido[0]} (${produtoMaisVendido[1]})` : 'Nenhum';

  refs.relatorioTableBody.innerHTML = sales.length
    ? sales
        .slice()
        .sort((a, b) => new Date(b.data || '1970-01-01') - new Date(a.data || '1970-01-01'))
        .map((item) => {
          const valorTotal = Number(item.valor || 0) * Number(item.quantidade || 0);
          return `
            <tr>
              <td>${item.data}</td>
              <td>${item.cliente}</td>
              <td>${item.nome} (${item.codigo})</td>
              <td>${item.quantidade}</td>
              <td>${formatCurrency(valorTotal)}</td>
            </tr>
          `;
        }).join('')
    : emptyRow(5);

  renderSalesChart(sales);
}

function renderSalesChart(sales) {
  if (!refs.salesChart) return;

  const chartData = sales.reduce((accumulator, item) => {
    const dateKey = item.data || 'Sem data';
    const total = Number(item.valor || 0) * Number(item.quantidade || 0);
    accumulator[dateKey] = (accumulator[dateKey] || 0) + total;
    return accumulator;
  }, {});

  const entries = Object.entries(chartData)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .slice(-7);

  const maxValue = Math.max(...entries.map(([, value]) => value), 1);

  refs.salesChart.innerHTML = entries.length
    ? entries.map(([date, value]) => {
        const height = Math.max((value / maxValue) * 100, 8);
        return `
          <div class="chart-column">
            <div class="chart-bar-wrap">
              <div class="chart-bar" style="height: ${height}%" title="${date}: ${formatCurrency(value)}"></div>
            </div>
            <span>${new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
          </div>
        `;
      }).join('')
    : '<div class="empty-state">Nenhuma venda para exibir no gráfico.</div>';
}

function emptyRow(colspan) {
  return `<tr><td colspan="${colspan}"><div class="empty-state">Nenhum registro encontrado.</div></td></tr>`;
}

function handleTableActions(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const { action, type, id } = button.dataset;

  if (action === 'edit') {
    openModal(type, id);
    return;
  }

  if (action === 'delete') {
    deleteRecord(type, id);
  }
}

function deleteRecord(type, id) {
  const confirmed = window.confirm('Deseja realmente excluir este registro?');
  if (!confirmed) return;

  if (type === 'venda') {
    const sale = state.sales.find((item) => item.id === id);
    if (sale) {
      const product = state.products.find((item) => item.codigo === sale.codigo || item.nome.toLowerCase() === sale.nome.toLowerCase());
      if (product) {
        product.quantidade += Number(sale.quantidade || 0);
      }
    }
  }

  if (type === 'produto') state.products = state.products.filter((item) => item.id !== id);
  if (type === 'compra') state.purchases = state.purchases.filter((item) => item.id !== id);
  if (type === 'estoque') state.stockEntries = state.stockEntries.filter((item) => item.id !== id);
  if (type === 'venda') state.sales = state.sales.filter((item) => item.id !== id);

  saveStorage();
  updateStats();
  renderAll();
  showToast('Registro removido com sucesso.');
}

function openModal(type, id = null) {
  state.editingType = type;
  state.editingId = id;

  const isEdit = Boolean(id);
  const titleMap = {
    produto: isEdit ? 'Editar produto' : 'Novo produto',
    compra: isEdit ? 'Editar compra' : 'Nova compra',
    estoque: isEdit ? 'Editar entrada de estoque' : 'Nova entrada de estoque',
    venda: isEdit ? 'Editar venda' : 'Nova venda'
  };
  refs.modalTitle.textContent = titleMap[type];

  let record = {};
  if (isEdit) {
    record = getCollection(type).find((item) => item.id === id) || {};
  }

  refs.modalForm.innerHTML = buildForm(type, record);
  refs.modalForm.onsubmit = handleModalSubmit;
  refs.modalOverlay.classList.remove('hidden');
}

function closeModal() {
  refs.modalOverlay.classList.add('hidden');
  refs.modalForm.reset?.();
  state.editingType = null;
  state.editingId = null;
}

function getCollection(type) {
  if (type === 'produto') return state.products;
  if (type === 'compra') return state.purchases;
  if (type === 'estoque') return state.stockEntries;
  return state.sales;
}

function buildForm(type, record = {}) {
  const safeRecord = record || {};

  if (type === 'produto') {
    return `
      <div class="field">
        <label for="codigo">Código</label>
        <input id="codigo" name="codigo" value="${safeRecord.codigo || ''}" required />
      </div>
      <div class="field">
        <label for="nome">Nome</label>
        <input id="nome" name="nome" value="${safeRecord.nome || ''}" required />
      </div>
      <div class="field">
        <label for="quantidade">Quantidade</label>
        <input id="quantidade" name="quantidade" type="number" min="0" value="${safeRecord.quantidade ?? ''}" required />
      </div>
      <div class="field">
        <label for="valor">Valor</label>
        <input id="valor" name="valor" type="number" min="0" step="0.01" value="${safeRecord.valor ?? ''}" required />
      </div>
      ${modalActions()}
    `;
  }

  if (type === 'compra') {
    return `
      <div class="field">
        <label for="data">Data</label>
        <input id="data" name="data" type="date" value="${safeRecord.data || ''}" required />
      </div>
      <div class="field">
        <label for="fornecedor">Fornecedor</label>
        <input id="fornecedor" name="fornecedor" value="${safeRecord.fornecedor || ''}" required />
      </div>
      <div class="field">
        <label for="valor">Valor</label>
        <input id="valor" name="valor" type="number" min="0" step="0.01" value="${safeRecord.valor ?? ''}" required />
      </div>
      <div class="field">
        <label for="situacao">Situação</label>
        <select id="situacao" name="situacao" required>
          <option value="Recebida" ${safeRecord.situacao === 'Recebida' ? 'selected' : ''}>Recebida</option>
          <option value="Pendente" ${safeRecord.situacao === 'Pendente' ? 'selected' : ''}>Pendente</option>
        </select>
      </div>
      <div class="field">
        <label for="nfe">NF-e</label>
        <input id="nfe" name="nfe" value="${safeRecord.nfe || ''}" required />
      </div>
      ${modalActions()}
    `;
  }

  if (type === 'venda') {
    return `
      <div class="field">
        <label for="data">Data</label>
        <input id="data" name="data" type="date" value="${safeRecord.data || ''}" required />
      </div>
      <div class="field">
        <label for="cliente">Cliente</label>
        <input id="cliente" name="cliente" value="${safeRecord.cliente || ''}" required />
      </div>
      <div class="field">
        <label for="codigo">Código</label>
        <input id="codigo" name="codigo" value="${safeRecord.codigo || ''}" required />
      </div>
      <div class="field">
        <label for="nome">Produto</label>
        <input id="nome" name="nome" value="${safeRecord.nome || ''}" required />
      </div>
      <div class="field">
        <label for="quantidade">Quantidade</label>
        <input id="quantidade" name="quantidade" type="number" min="1" value="${safeRecord.quantidade ?? ''}" required />
      </div>
      <div class="field">
        <label for="valor">Valor unitário</label>
        <input id="valor" name="valor" type="number" min="0" step="0.01" value="${safeRecord.valor ?? ''}" required />
      </div>
      ${modalActions()}
    `;
  }

  return `
    <div class="field">
      <label for="data">Data</label>
      <input id="data" name="data" type="date" value="${safeRecord.data || ''}" required />
    </div>
    <div class="field">
      <label for="codigo">Código</label>
      <input id="codigo" name="codigo" value="${safeRecord.codigo || ''}" required />
    </div>
    <div class="field">
      <label for="nome">Nome</label>
      <input id="nome" name="nome" value="${safeRecord.nome || ''}" required />
    </div>
    <div class="field">
      <label for="quantidade">Quantidade entregue</label>
      <input id="quantidade" name="quantidade" type="number" min="1" value="${safeRecord.quantidade ?? ''}" required />
    </div>
    ${modalActions()}
  `;
}

function modalActions() {
  return `
    <div class="modal-actions">
      <button type="button" class="btn" onclick="closeModal()">Cancelar</button>
      <button type="submit" class="btn btn-primary">Salvar</button>
    </div>
  `;
}

function handleModalSubmit(event) {
  event.preventDefault();
  const formData = new FormData(refs.modalForm);
  const type = state.editingType;
  const wasEditing = Boolean(state.editingId);
  const id = state.editingId || crypto.randomUUID();

  if (type === 'produto') {
    const record = {
      id,
      codigo: formData.get('codigo').trim(),
      nome: formData.get('nome').trim(),
      quantidade: Number(formData.get('quantidade')),
      valor: Number(formData.get('valor'))
    };
    upsertRecord('produto', record);
  }

  if (type === 'compra') {
    const record = {
      id,
      data: formData.get('data'),
      fornecedor: formData.get('fornecedor').trim(),
      valor: Number(formData.get('valor')),
      situacao: formData.get('situacao'),
      nfe: formData.get('nfe').trim()
    };
    upsertRecord('compra', record);
  }

  if (type === 'estoque') {
    const record = {
      id,
      data: formData.get('data'),
      codigo: formData.get('codigo').trim(),
      nome: formData.get('nome').trim(),
      quantidade: Number(formData.get('quantidade'))
    };
    upsertRecord('estoque', record);
  }

  if (type === 'venda') {
    const record = {
      id,
      data: formData.get('data'),
      cliente: formData.get('cliente').trim(),
      codigo: formData.get('codigo').trim(),
      nome: formData.get('nome').trim(),
      quantidade: Number(formData.get('quantidade')),
      valor: Number(formData.get('valor'))
    };

    const product = state.products.find((item) => item.codigo === record.codigo || item.nome.toLowerCase() === record.nome.toLowerCase());
    if (!product) {
      showToast('Produto não encontrado para registrar a venda.');
      return;
    }

    const currentSale = wasEditing ? state.sales.find((item) => item.id === state.editingId) : null;
    const previousProduct = currentSale
      ? state.products.find((item) => item.codigo === currentSale.codigo || item.nome.toLowerCase() === currentSale.nome.toLowerCase())
      : null;

    let adjustedStock = product.quantidade;

    if (currentSale) {
      adjustedStock += Number(currentSale.quantidade || 0);
      if (previousProduct && previousProduct.id !== product.id) {
        previousProduct.quantidade += Number(currentSale.quantidade || 0);
      }
    }

    if (adjustedStock < record.quantidade) {
      showToast('Estoque insuficiente para esta venda.');
      return;
    }

    product.quantidade = adjustedStock - record.quantidade;
    upsertRecord('venda', record);
  }

  saveStorage();
  updateStats();
  renderAll();
  closeModal();
  showToast(wasEditing ? 'Registro atualizado com sucesso.' : 'Registro adicionado com sucesso.');
}

function upsertRecord(type, record) {
  const collection = getCollection(type);
  const index = collection.findIndex((item) => item.id === record.id);

  if (index >= 0) {
    collection[index] = record;
  } else {
    collection.push(record);
  }

  if (type === 'produto') state.products = [...collection];
  if (type === 'compra') state.purchases = [...collection];
  if (type === 'estoque') state.stockEntries = [...collection];
  if (type === 'venda') state.sales = [...collection];
}

function renderAll() {
  renderProducts();
  renderPurchases();
  renderStockEntries();
  renderSales();
  renderSalesReport();
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2400);
}

window.closeModal = closeModal;
setup();
