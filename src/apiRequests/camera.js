
export async function startRecord() {
  try {
    const res = await fetch(`/api/camera/start`, {method: "POST",});
    // const data = await res.json()
    // const message = data.message

    if (!res.ok) 
      return {status:"error", msg: "Falha na API: Não foi possível iniciar gravação"}
    else
      return {status:"success", msg: "Gravação iniciada"}
    
  } catch (error) {
    console.log(error)
    return {status:"error", msg: "Erro inesperado na função startRecord()"}
  }
}

export async function stopRecord() {
  try {
    const res = await fetch(`/api/camera/stop`, {method: "POST",});
    // const data = await res.json()
    // const message = data.message

    if (!res.ok) 
      return {status:"error", msg: "Falha na API: Não foi possível encerrar gravação"}
    else
      return {status:"success", msg: "Gravação encerrada"}
    
  } catch (error) {
    console.log(error)
    return {status:"error", msg: "Erro inesperado na função startRecord"}
  }
}