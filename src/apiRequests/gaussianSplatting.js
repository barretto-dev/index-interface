const API_BASE = `http://${window.location.hostname}:3001`;

export async function startTrain() {
  const response = await fetch(`${API_BASE}/convert/run`, {
    method: "POST",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }

  return response.json();
}

export async function getOutputFolders() {
  const response = await fetch(`${API_BASE}/output/folders`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Erro ao listar pastas");
  }

  return response.json();
}