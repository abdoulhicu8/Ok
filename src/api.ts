export const API_BASE_URL = "https://deutsch-akademie.onrender.com";

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
