const RAW_API_URL =
  process.env.EXPO_PUBLIC_API_URL?.trim();

function getApiUrl() {
  if (!RAW_API_URL) {
    throw new Error(
      'EXPO_PUBLIC_API_URL não configurada. Configure apps/mobile/.env com o IP do computador.'
    );
  }

  return RAW_API_URL.replace(/\/+$/, '');
}

export async function apiGet<T>(
  path: string
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    8000
  );

  try {
    const response = await fetch(
      `${getApiUrl()}${path}`,
      {
        headers: {
          Accept: 'application/json'
        },
        signal: controller.signal
      }
    );

    if (!response.ok) {
      const body = await response.text();

      throw new Error(
        body ||
          `Erro HTTP ${response.status}`
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === 'AbortError'
    ) {
      throw new Error(
        'A API do App Cifra não respondeu. Confirme se o backend está rodando na porta 3001 e se o iPhone consegue abrir a URL /api/music/health.'
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
