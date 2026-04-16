const API_BASE = `http://${window.location.hostname}:3001`;

export async function startSibr(folderName) {
  try {
    const res = await fetch(`${API_BASE}/sibr/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ folderName })
    })
    return await res.text();
  } catch (err) {
    throw err;
  }
}

export async function stopSibr() {
  try {
    const res = await fetch(`${API_BASE}/sibr/stop`);
    return await res.text();
  } catch (err) {
    throw err;
  }
}