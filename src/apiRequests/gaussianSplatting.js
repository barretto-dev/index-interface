const API_BASE = `http://${window.location.hostname}:3001`;

export async function startTrain() {
  try {
    const res = await fetch(`${API_BASE}/gaussian/train/start`, {method: "POST"});
    const data = await res.json()
    const message = data.message

    if (!res.ok) 
      return {status:"error", msg: "Erro na requisição: "+message}
    else
      return {status:"success", msg: message}
    
  } catch (error) {
    console.log(error)
    return {status:"error", msg: "Erro inesperado na função startTrain()"}
  }
}

export async function stopTrain() {
  try {
    const res = await fetch(`${API_BASE}/gaussian/train/stop`, {method: "POST"});
    const data = await res.json()
    const message = data.message

    if (!res.ok) 
      return {status:"error", msg: "Erro na requisição: "+message}
    else
      return {status:"success", msg: message}
    
  } catch (error) {
    console.log(error)
    return {status:"error", msg: "Erro inesperado na função stopTrain()"}
  }
}

export async function getOutputFolders() {
  const response = await fetch(`${API_BASE}/output/folders`);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Erro ao listar pastas");
  }

  return response.json();
}