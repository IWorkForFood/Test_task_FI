import './style.css';
import { getCurrentUser, login, register, logout } from './auth.js';
import {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  getStatuses,
  getTransactionTypes,
  getCategories,
  getSubcategories,
  createStatus,
  updateStatus,
  deleteStatus,
  createTransactionType,
  updateTransactionType,
  deleteTransactionType,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from './api.js';

let currentUser = null;

function goTo(hash) {
  const h = hash.startsWith('#') ? hash : '#' + hash;
  if (location.hash !== h) {
    history.replaceState(null, '', h);
    if (currentUser) navigate();
  }
}

function setupNavigation() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#/"]');
    if (a) {
      e.preventDefault();
      goTo(a.getAttribute('href'));
    }
  }, true);
}

function renderAuthForms() {
  const app = document.querySelector('#app');
  app.innerHTML = `<div class="auth-container">
      <div class="auth-card" id="login-card">
        <h1>Вход</h1>
        <form id="login-form" class="auth-form">
          <div class="field">
            <label for="login-username">Логин</label>
            <input id="login-username" name="username" type="text" required autocomplete="username">
          </div>
          <div class="field">
            <label for="login-password">Пароль</label>
            <input id="login-password" name="password" type="password" required autocomplete="current-password">
          </div>
          <p class="error" id="login-error"></p>
          <button type="submit" class="btn btn-primary">Войти</button>
        </form>
        <p class="auth-switch">
          Нет аккаунта? <a href="#" id="show-register">Зарегистрироваться</a>
        </p>
      </div>

      <div class="auth-card hidden" id="register-card">
        <h1>Регистрация</h1>
        <form id="register-form" class="auth-form">
          <div class="field">
            <label for="reg-username">Логин</label>
            <input id="reg-username" name="username" type="text" required autocomplete="username">
          </div>
          <div class="field">
            <label for="reg-email">Email</label>
            <input id="reg-email" name="email" type="email" required autocomplete="email">
          </div>
          <div class="field">
            <label for="reg-password">Пароль</label>
            <input id="reg-password" name="password" type="password" required autocomplete="new-password" minlength="8">
          </div>
          <div class="field">
            <label for="reg-password-confirm">Повторите пароль</label>
            <input id="reg-password-confirm" name="password_confirm" type="password" required autocomplete="new-password">
          </div>
          <p class="error" id="register-error"></p>
          <button type="submit" class="btn btn-primary">Зарегистрироваться</button>
        </form>
        <p class="auth-switch">
          Уже есть аккаунт? <a href="#" id="show-login">Войти</a>
        </p>
      </div>
    </div>
  `;

  document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-card').classList.add('hidden');
    document.getElementById('register-card').classList.remove('hidden');
    document.getElementById('login-error').textContent = '';
    document.getElementById('register-error').textContent = '';
  });

  document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('register-card').classList.add('hidden');
    document.getElementById('login-card').classList.remove('hidden');
    document.getElementById('login-error').textContent = '';
    document.getElementById('register-error').textContent = '';
  });

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('login-error');
    errEl.textContent = '';
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    try {
      await login(username, password);
      await checkAuth();
    } catch (err) {
      errEl.textContent = err.message;
    }
  });

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = document.getElementById('register-error');
    errEl.textContent = '';
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const passwordConfirm = document.getElementById('reg-password-confirm').value;
    if (password !== passwordConfirm) {
      errEl.textContent = 'Пароли не совпадают';
      return;
    }
    try {
      await register(username, email, password, passwordConfirm);
      await checkAuth();
    } catch (err) {
      errEl.textContent = err.message;
    }
  });
}

async function renderApp() {
  const scrollY = window.scrollY;
  const app = document.querySelector('#app');
  app.innerHTML = `
    <div class="app-container">
      <header class="app-header">
        <span>Профиль <strong>${currentUser.username}</strong></span>
        <button id="logout-btn" class="btn btn-outline">Выйти</button>
      </header>
      <main class="app-main">
        <div class="records-header">
          <p class="welcome">Все записи</p>
          <div class="records-header-actions">
            <a href="#/settings" class="btn btn-outline">Справочники</a>
            <a href="#/records/new" class="btn btn-primary">Добавить запись</a>
          </div>
        </div>
        <div class="filters-panel">
          <div class="filters-row">
            <div class="filter-group">
              <label>Дата от</label>
              <input id="filter-date-from" type="date" class="filter-input">
            </div>
            <div class="filter-group">
              <label>Дата до</label>
              <input id="filter-date-to" type="date" class="filter-input">
            </div>
            <div class="filter-group">
              <label>Статус</label>
              <select id="filter-status" class="filter-select">
                <option value="">— Все —</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Тип</label>
              <select id="filter-type" class="filter-select">
                <option value="">— Все —</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Категория</label>
              <select id="filter-category" class="filter-select">
                <option value="">— Все —</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Подкатегория</label>
              <select id="filter-subcategory" class="filter-select">
                <option value="">— Все —</option>
              </select>
            </div>
            <div>
              <button type="button" id="filter-reset" class="btn btn-outline btn-sm">Сбросить</button>
            </div>
          </div>
        </div>
        <div id="records-loading" class="records-loading">Загрузка записей…</div>
        <div id="records-table-wrap" class="records-table-wrap hidden">
          <table class="records-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Статус</th>
                <th>Тип</th>
                <th>Категория</th>
                <th>Подкатегория</th>
                <th>Сумма</th>
                <th>Комментарий</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="records-tbody"></tbody>
          </table>
        </div>
        <div id="records-empty" class="records-empty hidden">
          <p>Записей пока нет.</p>
        </div>
      </main>
    </div>
  `;

  document.getElementById('logout-btn').addEventListener('click', async () => {
    await logout();
    currentUser = null;
    renderAuthForms();
  });

  const statusSelect = document.getElementById('filter-status');
  const typeSelect = document.getElementById('filter-type');
  const categorySelect = document.getElementById('filter-category');
  const subcategorySelect = document.getElementById('filter-subcategory');

  try {
    const [statuses, types] = await Promise.all([
      getStatuses(),
      getTransactionTypes(),
    ]);
    statuses.forEach((s) => {
      statusSelect.innerHTML += `<option value="${s.id}">${escapeHtml(s.name)}</option>`;
    });
    types.forEach((t) => {
      typeSelect.innerHTML += `<option value="${t.id}">${escapeHtml(t.name)}</option>`;
    });
  } catch (err) {
    console.error('Ошибка загрузки фильтров:', err);
  }

  const applyFilters = async () => {
    const filters = {
      date_from: document.getElementById('filter-date-from').value || undefined,
      date_to: document.getElementById('filter-date-to').value || undefined,
      status: document.getElementById('filter-status').value || undefined,
      transaction_type: document.getElementById('filter-type').value || undefined,
      category: document.getElementById('filter-category').value || undefined,
      subcategory: document.getElementById('filter-subcategory').value || undefined,
    };
    await loadRecords(filters);
  };

  typeSelect.addEventListener('change', async () => {
    const tid = typeSelect.value;
    categorySelect.innerHTML = '<option value="">— Все —</option>';
    subcategorySelect.innerHTML = '<option value="">— Все —</option>';
    if (tid) {
      const cats = await getCategories(tid);
      cats.forEach((c) => {
        categorySelect.innerHTML += `<option value="${c.id}">${escapeHtml(c.name)}</option>`;
      });
    }
    await applyFilters();
  });

  categorySelect.addEventListener('change', async () => {
    const cid = categorySelect.value;
    subcategorySelect.innerHTML = '<option value="">— Все —</option>';
    if (cid) {
      const subcats = await getSubcategories(cid);
      subcats.forEach((s) => {
        subcategorySelect.innerHTML += `<option value="${s.id}">${escapeHtml(s.name)}</option>`;
      });
    }
    await applyFilters();
  });

  document.getElementById('filter-date-from').addEventListener('change', applyFilters);
  document.getElementById('filter-date-to').addEventListener('change', applyFilters);
  statusSelect.addEventListener('change', applyFilters);
  subcategorySelect.addEventListener('change', applyFilters);

  document.getElementById('filter-reset').addEventListener('click', () => {
    document.getElementById('filter-date-from').value = '';
    document.getElementById('filter-date-to').value = '';
    statusSelect.value = '';
    typeSelect.value = '';
    categorySelect.innerHTML = '<option value="">— Все —</option>';
    subcategorySelect.innerHTML = '<option value="">— Все —</option>';
    loadRecords({});
  });

  async function loadRecords(filters) {
    document.getElementById('records-loading').classList.remove('hidden');
    document.getElementById('records-loading').textContent = 'Загрузка записей…';
    document.getElementById('records-table-wrap').classList.add('hidden');
    document.getElementById('records-empty').classList.add('hidden');

    try {
      let records = await getRecords(filters);
      if (records?.results) records = records.results;
      document.getElementById('records-loading').classList.add('hidden');

      if (!records?.length) {
        document.getElementById('records-empty').classList.remove('hidden');
      } else {
        const tbody = document.getElementById('records-tbody');
        tbody.innerHTML = '';
        records.forEach((r) => {
        const row = document.createElement('tr');
        row.dataset.id = r.id;
        row.style.cursor = 'pointer';
        const date = new Date(r.record_date).toLocaleDateString('ru-RU');
        const amount = new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0,
        }).format(r.amount);
        row.innerHTML = `
          <td>${date}</td>
          <td>${escapeHtml(r.status?.name ?? '—')}</td>
          <td>${escapeHtml(r.transaction_type?.name ?? '—')}</td>
          <td>${escapeHtml(r.category?.name ?? '—')}</td>
          <td>${escapeHtml(r.subcategory?.name ?? '—')}</td>
          <td>${amount}</td>
          <td>${escapeHtml(r.comment || '')}</td>
          <td class="record-actions"><button type="button" class="btn-delete" title="Удалить">✕</button></td>
        `;
        row.querySelector('.btn-delete').addEventListener('click', async (e) => {
          e.stopPropagation();
          if (!confirm('Удалить эту запись?')) return;
          try {
            await deleteRecord(r.id);
            await renderApp();
          } catch (err) {
            alert('Ошибка: ' + err.message);
          }
        });
        row.addEventListener('click', (e) => {
          if (e.target.closest('.btn-delete')) return;
          goTo(`#/records/${r.id}/edit`);
        });
        tbody.appendChild(row);
      });
      document.getElementById('records-table-wrap').classList.remove('hidden');
    }
  } catch (err) {
    document.getElementById('records-loading').textContent =
      'Ошибка загрузки: ' + err.message;
  }
  }

  await loadRecords({});
  requestAnimationFrame(() => window.scrollTo(0, scrollY));
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getRoute() {
  const hash = location.hash.slice(1) || '/records';
  if (hash === '/settings') return { view: 'settings' };
  const match = hash.match(/^\/records\/(new|(\d+)\/edit)$/);
  if (match) {
    return { view: 'form', id: match[1] === 'new' ? null : match[2] };
  }
  return { view: 'list' };
}

async function navigate() {
  if (!currentUser) return;
  const route = getRoute();
  if (route.view === 'settings') {
    await renderSettingsPage();
  } else if (route.view === 'form') {
    await renderRecordForm(route.id);
  } else {
    await renderApp();
  }
}

async function renderRecordForm(recordId) {
  const isEdit = !!recordId;
  const app = document.querySelector('#app');
  app.innerHTML = `
    <div class="app-container">
      <header class="app-header">
        <span>Профиль <strong>${currentUser.username}</strong></span>
        <button id="logout-btn" class="btn btn-outline">Выйти</button>
      </header>
      <main class="app-main">
        <a href="#/records" class="back-link">← К списку записей</a>
        <h2 class="form-title">${isEdit ? 'Редактирование записи' : 'Новая запись'}</h2>
        <div id="form-loading" class="records-loading">Загрузка…</div>
        <form id="record-form" class="record-form hidden">
          <div class="record-form__inner">
          <div class="field">
            <label for="record-date">Дата</label>
            <input id="record-date" name="record_date" type="date" required>
          </div>
          <div class="field">
            <label for="record-status">Статус</label>
            <select id="record-status" name="status" required></select>
          </div>
          <div class="field">
            <label for="record-type">Тип операции</label>
            <select id="record-type" name="transaction_type" required></select>
          </div>
          <div class="field">
            <label for="record-category">Категория</label>
            <select id="record-category" name="category" required>
              <option value="">— Выберите тип сначала —</option>
            </select>
          </div>
          <div class="field">
            <label for="record-subcategory">Подкатегория</label>
            <select id="record-subcategory" name="subcategory" required>
              <option value="">— Выберите категорию сначала —</option>
            </select>
          </div>
          <div class="field">
            <label for="record-amount">Сумма (₽)</label>
            <input id="record-amount" name="amount" type="number" step="0.01" min="0" required placeholder="0">
          </div>
          <div class="field">
            <label for="record-comment">Комментарий</label>
            <textarea id="record-comment" name="comment" rows="3" placeholder="Необязательно"></textarea>
          </div>
          <p class="error" id="form-error"></p>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">${isEdit ? 'Сохранить' : 'Создать'}</button>
            <a href="#/records" class="btn btn-outline btn-link">Отмена</a>
          </div>
          </div>
        </form>
      </main>
    </div>
  `;

  document.getElementById('logout-btn').addEventListener('click', async () => {
    await logout();
    currentUser = null;
    renderAuthForms();
  });

  try {
    const [statuses, types] = await Promise.all([
      getStatuses(),
      getTransactionTypes(),
    ]);

    const statusSelect = document.getElementById('record-status');
    statuses.forEach((s) => {
      statusSelect.innerHTML += `<option value="${s.id}">${escapeHtml(s.name)}</option>`;
    });

    const typeSelect = document.getElementById('record-type');
    types.forEach((t) => {
      typeSelect.innerHTML += `<option value="${t.id}">${escapeHtml(t.name)}</option>`;
    });

    let record = null;
    if (recordId) {
      record = await getRecord(recordId);
      document.getElementById('record-date').value = record.record_date;
      document.getElementById('record-status').value =
        record.status?.id ?? record.status;
      document.getElementById('record-type').value =
        record.transaction_type?.id ?? record.transaction_type;
      document.getElementById('record-amount').value = record.amount;
      document.getElementById('record-comment').value = record.comment || '';
      const catId = record.category?.id ?? record.category;
      const subId = record.subcategory?.id ?? record.subcategory;
      if (catId) {
        const categories = await getCategories(record.transaction_type?.id ?? record.transaction_type);
        fillSelect('record-category', categories, true);
        document.getElementById('record-category').value = String(catId);
        const subcats = await getSubcategories(catId);
        fillSelect('record-subcategory', subcats, '— Выберите —');
        if (subId) document.getElementById('record-subcategory').value = String(subId);
      }
    } else {
      const today = new Date().toISOString().slice(0, 10);
      document.getElementById('record-date').value = today;
    }

    document.getElementById('form-loading').classList.add('hidden');
    document.getElementById('record-form').classList.remove('hidden');

    const loadCategoriesForType = async () => {
      const tid = typeSelect.value;
      document.getElementById('record-category').innerHTML =
        '<option value="">— Выберите —</option>';
      document.getElementById('record-subcategory').innerHTML =
        '<option value="">— Выберите категорию сначала —</option>';
      if (tid) {
        const cats = await getCategories(tid);
        fillSelect('record-category', cats, true);
      }
    };

    typeSelect.addEventListener('change', loadCategoriesForType);

    // Загрузить категории, если тип уже выбран (например, первый в списке)
    if (typeSelect.value) {
      await loadCategoriesForType();
    }

    document.getElementById('record-category').addEventListener('change', async () => {
      const cid = document.getElementById('record-category').value;
      document.getElementById('record-subcategory').innerHTML =
        '<option value="">— Выберите —</option>';
      if (cid) {
        const subcats = await getSubcategories(cid);
        fillSelect('record-subcategory', subcats, '— Выберите —');
      }
    });

    document.getElementById('record-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const errEl = document.getElementById('form-error');
      errEl.textContent = '';
      const data = {
        record_date: document.getElementById('record-date').value,
        status: Number(document.getElementById('record-status').value),
        transaction_type: Number(document.getElementById('record-type').value),
        category: Number(document.getElementById('record-category').value),
        amount: document.getElementById('record-amount').value,
        comment: document.getElementById('record-comment').value.trim(),
      };
      const sub = document.getElementById('record-subcategory').value;
      data.subcategory = sub ? Number(sub) : undefined;
      try {
        if (isEdit) {
          await updateRecord(recordId, data);
        } else {
          await createRecord(data);
        }
        goTo('#/records');
      } catch (err) {
        const msg =
          typeof err.message === 'string' && err.message.startsWith('{')
            ? JSON.parse(err.message)
            : { _: err.message };
        const text =
          msg.record_date?.[0] ||
          msg.status?.[0] ||
          msg.transaction_type?.[0] ||
          msg.category?.[0] ||
          msg.amount?.[0] ||
          msg._ ||
          'Ошибка сохранения';
        errEl.textContent = Array.isArray(text) ? text[0] : text;
      }
    });
  } catch (err) {
    document.getElementById('form-loading').textContent =
      'Ошибка: ' + err.message;
  }
}

async function renderSettingsPage() {
  const scrollY = window.scrollY;
  const app = document.querySelector('#app');
  app.innerHTML = `
    <div class="app-container settings-container">
      <header class="app-header">
        <span>Профиль <strong>${currentUser.username}</strong></span>
        <button id="logout-btn" class="btn btn-outline">Выйти</button>
      </header>
      <main class="app-main">
        <a href="#/records" class="back-link">← К списку записей</a>
        <h2 class="form-title">Справочники</h2>
        <div id="settings-content" class="settings-content">Загрузка…</div>
      </main>
    </div>
  `;

  document.getElementById('logout-btn').addEventListener('click', async () => {
    await logout();
    currentUser = null;
    renderAuthForms();
  });

  const content = document.getElementById('settings-content');

  try {
    const [statuses, types, categories, subcategories] = await Promise.all([
      getStatuses(),
      getTransactionTypes(),
      getCategories(),
      getSubcategories(),
    ]);

    content.innerHTML = `
      <section class="settings-section">
        <h3>Статусы</h3>
        <div class="settings-row">
          <input id="status-name" type="text" placeholder="Название" class="settings-input">
          <button type="button" id="status-add" class="btn btn-primary btn-sm">Добавить</button>
        </div>
        <ul id="status-list" class="settings-list"></ul>
      </section>
      <section class="settings-section">
        <h3>Типы операций</h3>
        <div class="settings-row">
          <input id="type-name" type="text" placeholder="Название" class="settings-input">
          <button type="button" id="type-add" class="btn btn-primary btn-sm">Добавить</button>
        </div>
        <ul id="type-list" class="settings-list"></ul>
      </section>
      <section class="settings-section">
        <h3>Категории</h3>
        <div class="settings-row">
          <select id="cat-type" class="settings-select"></select>
          <input id="cat-name" type="text" placeholder="Название" class="settings-input">
          <button type="button" id="cat-add" class="btn btn-primary btn-sm">Добавить</button>
        </div>
        <ul id="cat-list" class="settings-list"></ul>
      </section>
      <section class="settings-section">
        <h3>Подкатегории</h3>
        <div class="settings-row">
          <select id="subcat-category" class="settings-select"></select>
          <input id="subcat-name" type="text" placeholder="Название" class="settings-input">
          <button type="button" id="subcat-add" class="btn btn-primary btn-sm">Добавить</button>
        </div>
        <ul id="subcat-list" class="settings-list"></ul>
      </section>
    `;

    const statusList = document.getElementById('status-list');
    statuses.forEach((s) => {
      statusList.appendChild(createEditableListItem({
        name: s.name,
        id: s.id,
        onDelete: () => deleteStatus(s.id),
        onSave: (name) => updateStatus(s.id, { name }),
        refresh: renderSettingsPage,
      }));
    });
    document.getElementById('status-add').addEventListener('click', async () => {
      const name = document.getElementById('status-name').value.trim();
      if (!name) return;
      await createStatus({ name });
      document.getElementById('status-name').value = '';
      await renderSettingsPage();
    });

    const typeList = document.getElementById('type-list');
    types.forEach((t) => {
      typeList.appendChild(createEditableListItem({
        name: t.name,
        id: t.id,
        onDelete: () => deleteTransactionType(t.id),
        onSave: (name) => updateTransactionType(t.id, { name }),
        refresh: renderSettingsPage,
      }));
    });
    document.getElementById('type-add').addEventListener('click', async () => {
      const name = document.getElementById('type-name').value.trim();
      if (!name) return;
      await createTransactionType({ name });
      document.getElementById('type-name').value = '';
      await renderSettingsPage();
    });

    const catTypeSelect = document.getElementById('cat-type');
    catTypeSelect.innerHTML = '<option value="">— Выберите тип —</option>';
    types.forEach((t) => {
      catTypeSelect.innerHTML += `<option value="${t.id}">${escapeHtml(t.name)}</option>`;
    });
    const catList = document.getElementById('cat-list');
    categories.forEach((c) => {
      const typeId = c.transaction_type;
      const typeName = types.find((t) => t.id === typeId)?.name ?? '';
      catList.appendChild(createEditableCategoryItem({
        name: c.name,
        id: c.id,
        typeId,
        types,
        onDelete: () => deleteCategory(c.id),
        onSave: (data) => updateCategory(c.id, data),
        refresh: renderSettingsPage,
      }));
    });
    document.getElementById('cat-add').addEventListener('click', async () => {
      const tid = document.getElementById('cat-type').value;
      const name = document.getElementById('cat-name').value.trim();
      if (!tid || !name) return;
      await createCategory({ name, transaction_type: Number(tid) });
      document.getElementById('cat-name').value = '';
      await renderSettingsPage();
    });

    const subcatCat = document.getElementById('subcat-category');
    subcatCat.innerHTML = '<option value="">— Выберите категорию —</option>';
    categories.forEach((c) => {
      const typeName = types.find((t) => t.id === c.transaction_type)?.name ?? '';
      subcatCat.innerHTML += `<option value="${c.id}">${escapeHtml(c.name)} (${escapeHtml(typeName)})</option>`;
    });

    const subcatList = document.getElementById('subcat-list');
    subcategories.forEach((s) => {
      const catId = s.category;
      const catName = categories.find((c) => c.id === catId)?.name ?? '';
      subcatList.appendChild(createEditableSubcategoryItem({
        name: s.name,
        id: s.id,
        categoryId: catId,
        categories,
        types,
        onDelete: () => deleteSubcategory(s.id),
        onSave: (data) => updateSubcategory(s.id, data),
        refresh: renderSettingsPage,
      }));
    });
    document.getElementById('subcat-add').addEventListener('click', async () => {
      const cid = document.getElementById('subcat-category').value;
      const name = document.getElementById('subcat-name').value.trim();
      if (!cid || !name) return;
      await createSubcategory({ name, category: Number(cid) });
      document.getElementById('subcat-name').value = '';
      await renderSettingsPage();
    });
  } catch (err) {
    content.textContent = 'Ошибка: ' + err.message;
  }
  requestAnimationFrame(() => window.scrollTo(0, scrollY));
}

function createEditableListItem({ name, id, onDelete, onSave, refresh }) {
  const li = document.createElement('li');
  li.className = 'settings-list-item';

  function showView() {
    li.innerHTML = `
      <span class="settings-item-name">${escapeHtml(name)}</span>
      <div class="settings-item-actions">
        <button type="button" class="btn-edit btn-sm" title="Редактировать">✎</button>
        <button type="button" class="btn-delete btn-sm" title="Удалить">✕</button>
      </div>
    `;
    li.querySelector('.btn-edit').addEventListener('click', () => showEdit());
    li.querySelector('.btn-delete').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!confirm('Удалить?')) return;
      try {
        await onDelete();
        await refresh();
      } catch (err) {
        alert('Ошибка: ' + err.message);
      }
    });
  }

  function showEdit() {
    li.innerHTML = `
      <div class="settings-edit-row settings-edit-row--single">
        <input type="text" class="settings-edit-input" value="${escapeHtml(name)}">
      </div>
      <div class="settings-item-actions">
        <button type="button" class="btn-save btn-sm" title="Сохранить">✓</button>
        <button type="button" class="btn-cancel btn-sm" title="Отмена">✕</button>
      </div>
    `;
    const input = li.querySelector('.settings-edit-input');
    input.focus({ preventScroll: true });
    input.select();
    li.querySelector('.btn-save').addEventListener('click', async () => {
      const val = input.value.trim();
      if (!val) return;
      try {
        await onSave(val);
        await refresh();
      } catch (err) {
        alert('Ошибка: ' + err.message);
      }
    });
    li.querySelector('.btn-cancel').addEventListener('click', () => showView());
  }

  showView();
  return li;
}

function createEditableCategoryItem({ name, id, typeId, types, onDelete, onSave, refresh }) {
  const li = document.createElement('li');
  li.className = 'settings-list-item';

  function showView() {
    const typeName = types.find((t) => t.id === typeId)?.name ?? '';
    li.innerHTML = `
      <span class="settings-item-name">${escapeHtml(name)} (${escapeHtml(typeName)})</span>
      <div class="settings-item-actions">
        <button type="button" class="btn-edit btn-sm" title="Редактировать">✎</button>
        <button type="button" class="btn-delete btn-sm" title="Удалить">✕</button>
      </div>
    `;
    li.querySelector('.btn-edit').addEventListener('click', () => showEdit());
    li.querySelector('.btn-delete').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!confirm('Удалить?')) return;
      try {
        await onDelete();
        await refresh();
      } catch (err) {
        alert('Ошибка: ' + err.message);
      }
    });
  }

  function showEdit() {
    const typeOptions = types.map((t) =>
      `<option value="${t.id}" ${t.id === typeId ? 'selected' : ''}>${escapeHtml(t.name)}</option>`
    ).join('');
    li.innerHTML = `
      <div class="settings-edit-row">
        <input type="text" class="settings-edit-input" value="${escapeHtml(name)}" placeholder="Название">
        <select class="settings-edit-select">${typeOptions}</select>
      </div>
      <div class="settings-item-actions">
        <button type="button" class="btn-save btn-sm" title="Сохранить">✓</button>
        <button type="button" class="btn-cancel btn-sm" title="Отмена">✕</button>
      </div>
    `;
    const input = li.querySelector('.settings-edit-input');
    input.focus({ preventScroll: true });
    li.querySelector('.btn-save').addEventListener('click', async () => {
      const val = input.value.trim();
      const tid = Number(li.querySelector('.settings-edit-select').value);
      if (!val) return;
      try {
        await onSave({ name: val, transaction_type: tid });
        await refresh();
      } catch (err) {
        alert('Ошибка: ' + err.message);
      }
    });
    li.querySelector('.btn-cancel').addEventListener('click', () => showView());
  }

  showView();
  return li;
}

function createEditableSubcategoryItem({ name, id, categoryId, categories, types, onDelete, onSave, refresh }) {
  const li = document.createElement('li');
  li.className = 'settings-list-item';

  function showView() {
    const catName = categories.find((c) => c.id === categoryId)?.name ?? '';
    li.innerHTML = `
      <span class="settings-item-name">${escapeHtml(name)} (${escapeHtml(catName)})</span>
      <div class="settings-item-actions">
        <button type="button" class="btn-edit btn-sm" title="Редактировать">✎</button>
        <button type="button" class="btn-delete btn-sm" title="Удалить">✕</button>
      </div>
    `;
    li.querySelector('.btn-edit').addEventListener('click', () => showEdit());
    li.querySelector('.btn-delete').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!confirm('Удалить?')) return;
      try {
        await onDelete();
        await refresh();
      } catch (err) {
        alert('Ошибка: ' + err.message);
      }
    });
  }

  function showEdit() {
    const catOptions = categories.map((c) => {
      const typeName = types.find((t) => t.id === c.transaction_type)?.name ?? '';
      return `<option value="${c.id}" ${c.id === categoryId ? 'selected' : ''}>${escapeHtml(c.name)} (${escapeHtml(typeName)})</option>`;
    }).join('');
    li.innerHTML = `
      <div class="settings-edit-row">
        <input type="text" class="settings-edit-input" value="${escapeHtml(name)}" placeholder="Название">
        <select class="settings-edit-select">${catOptions}</select>
      </div>
      <div class="settings-item-actions">
        <button type="button" class="btn-save btn-sm" title="Сохранить">✓</button>
        <button type="button" class="btn-cancel btn-sm" title="Отмена">✕</button>
      </div>
    `;
    const input = li.querySelector('.settings-edit-input');
    input.focus({ preventScroll: true });
    li.querySelector('.btn-save').addEventListener('click', async () => {
      const val = input.value.trim();
      const cid = Number(li.querySelector('.settings-edit-select').value);
      if (!val) return;
      try {
        await onSave({ name: val, category: cid });
        await refresh();
      } catch (err) {
        alert('Ошибка: ' + err.message);
      }
    });
    li.querySelector('.btn-cancel').addEventListener('click', () => showView());
  }

  showView();
  return li;
}

function fillSelect(id, items, emptyOption = false) {
  const sel = document.getElementById(id);
  const cur = sel.value;
  sel.innerHTML =
    emptyOption === true
      ? '<option value="">— Выберите —</option>'
      : emptyOption
        ? `<option value="">${escapeHtml(emptyOption)}</option>`
        : '';
  items.forEach((it) => {
    sel.innerHTML += `<option value="${it.id}">${escapeHtml(it.name)}</option>`;
  });
  if (cur) sel.value = cur;
}

async function checkAuth() {
  currentUser = await getCurrentUser();
  if (currentUser) {
    setupNavigation();
    window.addEventListener('hashchange', navigate);
    await navigate();
  } else {
    renderAuthForms();
  }
}

// Инициализация
setupNavigation();
checkAuth();
