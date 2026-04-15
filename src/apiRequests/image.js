const API_BASE = `http://${window.location.hostname}:3001`;

export async function downloadAndSaveZip() {
  const res = await fetch(`${API_BASE}/images/download-and-save`);

  if (!res.ok) {
    throw new Error("Erro ao salvar zip");
  }

  return res.text();
}

export async function prepare() {
  const response = await fetch(`${API_BASE}/images/prepare`, {
    method: "POST",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return response.json();
}