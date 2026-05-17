

async function test() {
  const query = `
    [out:json][timeout:10];
    (
      node["amenity"="blood_bank"](around:10000,28.6139,77.2090);
      node["healthcare"="blood_bank"](around:10000,28.6139,77.2090);
      node["amenity"="hospital"](around:10000,28.6139,77.2090);
    );
    out center body;
  `;
  const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);
  try {
    const res = await globalThis.fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "BloodBankApp/1.0"
      }
    });
    if (!res.ok) throw new Error("Status: " + res.status);
    const data = await res.json();
    console.log("Found:", data.elements ? data.elements.length : 0);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
