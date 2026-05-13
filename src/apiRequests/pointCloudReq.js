const API_BASE = `http://${window.location.hostname}:3001`;

export async function startGeneration(cameraUrl, cameraPort) {
  try {
    const res = await fetch(`${API_BASE}/pointCloud/generation/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wsUrl: cameraUrl, wsPort: cameraPort})
    });
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

export async function stopGeneration() {
  try {
    const res = await fetch(`${API_BASE}/pointCloud/generation/stop`, {method: "POST"});
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