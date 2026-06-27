SUPERVISÓRIO INDUSTRIAL 4.0 — X-RAY HOLOGRAPHIC

Como usar:
1. Extraia a pasta.
2. Abra o arquivo index.html no navegador.
3. Para evitar bloqueio de CDN, use internet ativa.
4. Para deploy, envie index.html, style.css e app.js para GitHub/Vercel/Netlify.

Bibliotecas usadas por CDN:
- Three.js
- OrbitControls
- EffectComposer
- UnrealBloomPass
- Chart.js

Onde integrar ESP32 LoRaWAN/Firebase:
No arquivo app.js, substitua a função updateTelemetry() pelos dados reais vindos do Firebase, MQTT ou WebSocket.

Variáveis principais:
- data.level
- data.current
- data.temp
- data.flow
- data.pressure
- data.rssi
- data.snr
