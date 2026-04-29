const API_BASE = `http://${window.location.hostname}:3001`;

export async function downloadAndSaveZip(droneApiUrl, droneApiPort) {
  try {
    const res = await fetch(`${API_BASE}/images/download-and-save`, {
      method: "POST",
      headers: {"Content-Type": "application/json",},
      body: JSON.stringify({droneApiUrl, droneApiPort})
    });
    const data = await res.json()
    const message = data.message

    if (!res.ok) 
      return {status:"error", msg: "Erro na requisição: "+message}
    else
      return {status:"success", msg: message}
    
  } catch (error) {
    console.log(error)
    return {status:"error", msg: "Erro inesperado na função downloadAndSaveZip()"}
  }
}

export async function startPreparetion() {
  try {
    const res = await fetch(`${API_BASE}/images/prepare/start`, {method: "POST"});
    const data = await res.json()
    const message = data.message

    if (!res.ok) 
      return {status:"error", msg: "Erro na requisição: "+message}
    else
      return {status:"success", msg: message}
    
  } catch (error) {
    console.log(error)
    return {status:"error", msg: "Erro inesperado na função startPreparetion()"}
  }
}

export async function stopPreparation() {
  try {
    const res = await fetch(`${API_BASE}/images/prepare/stop`, {method: "POST"});
    const data = await res.json()
    const message = data.message

    if (!res.ok) 
      return {status:"error", msg: "Erro na requisição: "+message}
    else
      return {status:"success", msg: message}
    
  } catch (error) {
    console.log(error)
    return {status:"error", msg: "Erro inesperado na função stopPreparation()"}
  }
}