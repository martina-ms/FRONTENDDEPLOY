/**
 * fetchProtected(getAccessTokenSilently, url, options)
 * - getAccessTokenSilently: provisto por useAuth().getAccessTokenSilently
 * - url: endpoint del backend
 * - options: fetch options
 *
 * Ejemplo de uso en componente:
 * const { getAccessTokenSilently } = useAuth();
 * const data = await fetchProtected(getAccessTokenSilently, "/api/private");
 */
export async function fetchProtected(getAccessTokenSilently, url, options = {}) {
  const audience = process.env.REACT_APP_AUTH0_AUDIENCE;
  const token = await getAccessTokenSilently({
    authorizationParams: { audience },
  });

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json();
}