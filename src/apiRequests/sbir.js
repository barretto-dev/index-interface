const API_BASE = `http://${window.location.hostname}:3001`;

export async function startSibr() {
  try {
    const res = await fetch(`${API_BASE}/sibr/start`);
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