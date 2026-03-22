import { api } from './api.js';

export async function getCurrentUser() {
  const res = await api('/auth/me/');
  if (res.ok) return res.json();
  return null;
}

export async function login(username, password) {
  const res = await api('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data.detail || data.password?.[0] || data.username?.[0] || 'Ошибка входа';
    throw new Error(Array.isArray(msg) ? msg[0] : msg);
  }
  return data;
}

export async function register(username, email, password, passwordConfirm) {
  const res = await api('/auth/register/', {
    method: 'POST',
    body: JSON.stringify({
      username,
      email,
      password,
      password_confirm: passwordConfirm,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data.username?.[0] ||
      data.email?.[0] ||
      data.password?.[0] ||
      data.password_confirm?.[0] ||
      data.detail ||
      'Ошибка регистрации';
    throw new Error(Array.isArray(msg) ? msg[0] : msg);
  }
  return data;
}

export async function logout() {
  await api('/auth/logout/', { method: 'POST' });
}
