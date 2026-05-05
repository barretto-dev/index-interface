
export async function startRecord(fallbackConfig) {
  if (fallbackConfig.recordMode === "live_stream") {
    return await startRecordFallback(fallbackConfig);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`/api/camera/start`, { 
      method: "POST",
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);



    if (!res.ok)
      return { status: "error", msg: "Falha na API do Drone" };
    else
      return { status: "success", msg: "Gravação iniciada (Drone API)" }

  } catch (error) {
    if (error.name === 'AbortError') {
      return { status: "error", msg: "Timeout: A API do Drone não respondeu em 10s" };
    }
    return { status: "error", msg: "Drone API Indisponível" };
  }


}

async function startRecordFallback(config) {
  try {
    const res = await fetch(`http://${window.location.hostname}:3001/images/record-ws/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wsUrl: config.wsUrl })
    });
    
    const data = await res.json();

    if (!res.ok)
      return { status: "error", msg: "Falha na API e no Fallback: " + (data.message || "") }
    else
      return { status: "success", msg: "Gravação iniciada (Fallback WS)" }

  } catch (error) {
    console.log(error)
    return { status: "error", msg: "Erro ao tentar iniciar gravação de fallback" }
  }
}

export async function stopRecord(fallbackConfig) {
  if (fallbackConfig.recordMode === "live_stream") {
    return await stopRecordFallback();
  }

  try {

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`/api/camera/stop`, { 
      method: "POST",
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok)
      return { status: "error", msg: "Falha ao encerrar na API do Drone" };
    else
      return { status: "success", msg: "Gravação encerrada (Drone API)" }

  } catch (error) {
    if (error.name === 'AbortError') {
      return { status: "error", msg: "Timeout: A API do Drone não respondeu para encerrar" };
    }
    return { status: "error", msg: "Drone API Indisponível para parar" };
  }
}



async function stopRecordFallback() {
  try {
    const res = await fetch(`http://${window.location.hostname}:3001/images/record-ws/stop`, {
      method: "POST",
    });
    
    const data = await res.json();

    if (!res.ok)
      return { status: "error", msg: "Falha ao encerrar gravação de fallback: " + (data.message || "") }
    else
      return { status: "success", msg: "Gravação encerrada (Fallback WS)" }

  } catch (error) {
    console.log(error)
    return { status: "error", msg: "Erro ao tentar encerrar gravação de fallback" }
  }
}