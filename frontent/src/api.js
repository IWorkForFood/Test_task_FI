import { API_BASE } from './config.js';

function getCsrfToken() {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : null;
}

export async function api(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = getCsrfToken();
  if (token) {
    headers['X-CSRFToken'] = token;
  }
  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
  return res;
}

export async function getRecords(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v != null && v !== '') params.append(k, v);
  });
  const qs = params.toString();
  const url = qs ? `/dds/records/?${qs}` : '/dds/records/';
  const res = await api(url);
  if (!res.ok) throw new Error('Не удалось загрузить записи');
  return res.json();
}

export async function getRecord(id) {
  const res = await api(`/dds/records/${id}/`);
  if (!res.ok) throw new Error('Запись не найдена');
  return res.json();
}

export async function createRecord(data) {
  const res = await api('/dds/records/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return res.json();
}

export async function updateRecord(id, data) {
  const res = await api(`/dds/records/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return res.json();
}

export async function deleteRecord(id) {
  const res = await api(`/dds/records/${id}/`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Не удалось удалить запись');
}

export async function getStatuses() {
  const res = await api('/dds/statuses/');
  if (!res.ok) throw new Error('Не удалось загрузить статусы');
  return res.json();
}

export async function getTransactionTypes() {
  const res = await api('/dds/transaction-types/');
  if (!res.ok) throw new Error('Не удалось загрузить типы');
  return res.json();
}

export async function getCategories(transactionTypeId) {
  const url = transactionTypeId
    ? `/dds/categories/?transaction_type=${transactionTypeId}`
    : '/dds/categories/';
  const res = await api(url);
  if (!res.ok) throw new Error('Не удалось загрузить категории');
  return res.json();
}

export async function getSubcategories(categoryId) {
  const url = categoryId
    ? `/dds/subcategories/?category=${categoryId}`
    : '/dds/subcategories/';
  const res = await api(url);
  if (!res.ok) throw new Error('Не удалось загрузить подкатегории');
  return res.json();
}

async function crud(endpoint, method, data, id) {
  const url = id ? `${endpoint}${id}/` : endpoint;
  const options = { method };
  if (data && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }
  const res = await api(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return res.status !== 204 ? res.json() : null;
}

export const createStatus = (d) => crud('/dds/statuses/', 'POST', d);
export const updateStatus = (id, d) => crud('/dds/statuses/', 'PATCH', d, id);
export const deleteStatus = (id) => crud('/dds/statuses/', 'DELETE', null, id);

export const createTransactionType = (d) => crud('/dds/transaction-types/', 'POST', d);
export const updateTransactionType = (id, d) => crud('/dds/transaction-types/', 'PATCH', d, id);
export const deleteTransactionType = (id) => crud('/dds/transaction-types/', 'DELETE', null, id);

export const createCategory = (d) => crud('/dds/categories/', 'POST', d);
export const updateCategory = (id, d) => crud('/dds/categories/', 'PATCH', d, id);
export const deleteCategory = (id) => crud('/dds/categories/', 'DELETE', null, id);

export const createSubcategory = (d) => crud('/dds/subcategories/', 'POST', d);
export const updateSubcategory = (id, d) => crud('/dds/subcategories/', 'PATCH', d, id);
export const deleteSubcategory = (id) => crud('/dds/subcategories/', 'DELETE', null, id);
