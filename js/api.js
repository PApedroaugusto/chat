const BASE_URL =
  location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://chat-wtt9.onrender.com";

window.API_VEHICLES = `${BASE_URL}/vehicles`;
