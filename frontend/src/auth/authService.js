// src/auth/authService.js
// Un pequeño servicio que guarda una función para obtener el access token.
// La función es registrada desde React (donde tenemos getAccessTokenSilently).
let tokenGetter = null;

/**
 * Registrar una función async que devuelva el token (string) cuando se llame.
 * Ej: setTokenGetter(() => getAccessTokenSilently({ authorizationParams: { audience } }))
 */
export function setTokenGetter(fn) {
  tokenGetter = fn;
}

/**
 * Llamar para obtener el token. Retorna null si no hay getter o si falla.
 */
export async function getToken() {
  if (!tokenGetter) return null;
  try {
    const t = await tokenGetter();
    return t || null;
  } catch (e) {
    // No lanzar para que axios siga su flujo (se puede manejar 401 en backend)
    console.warn("authService: fallo al obtener token", e);
    return null;
  }
}

/**
 * Limpiar el getter (p. ej. al cerrar sesión)
 */
export function clearTokenGetter() {
  tokenGetter = null;
}
