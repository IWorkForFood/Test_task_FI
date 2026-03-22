// В dev используем прокси Vite → backend, в prod — полный URL
export const API_BASE =
  import.meta.env.VITE_API_URL || '/api/v1';
