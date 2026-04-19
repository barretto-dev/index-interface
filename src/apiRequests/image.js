const API_BASE = `http://${window.location.hostname}:3001`;

export async function downloadAndSaveZip() {
  try {
    const res = await fetch(`${API_BASE}/images/download-and-save`);
    const data = await res.json()
    const message = data.message

    if (!res.ok) 
      return {status:"error", msg: "Erro na requisição: "+message}
    else
      return {status:"success", msg: message}
    
  } catch (error) {
    console.log(error)
    return {status:"error", msg: "Erro inesperado na função downloadAndSaveZip"}
  }
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