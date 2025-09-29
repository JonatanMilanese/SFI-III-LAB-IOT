// ========= Firebase (opcional para logs) =========
let db = null, auth = null, userId = null, isAuthReady = false;
const appId = window.__app_id || "jjj-proyecto-software";

if (typeof firebase !== "undefined" && window.__firebase_config) {
    try {
        const app = firebase.initializeApp(window.__firebase_config);
        db = firebase.firestore(app);
        auth = firebase.auth(app);

        auth.onAuthStateChanged(async (u) => {
            if (!u) await auth.signInAnonymously();
            userId = auth.currentUser?.uid || null;
            isAuthReady = true;
            if (document.getElementById("data-table")) startDatabaseListener();
        });
    } catch (e) {
        console.error("Firebase init error", e);
    }
}

function getPublicCollectionRef(name) {
    return db.collection(`artifacts/${appId}/public/data/${name}`);
}

async function logToFirestore(action, source) {
    if (!db || !isAuthReady) return;
    try {
        await getPublicCollectionRef("led_logs").add({
            action,
            device_id: "app_control_maui",
            source,
            created_at: new Date().toISOString().slice(0, 19).replace("T", " ")
        });
    } catch (e) {
        console.warn("No se pudo loguear en Firestore:", e?.message || e);
    }
}

// ========= MQTT (WebSockets) para cmd/state) =========
const { url, clientId, username, password } = window.__mqtt;
const TOPICS = window.__topics;

let mqttClient = null, isMqttReady = false;

function connectMqtt() {
    mqttClient = mqtt.connect(url, {
        clientId, username, password,
        keepalive: 30, clean: true,
        reconnectPeriod: 2000, connectTimeout: 10000
    });

    mqttClient.on("connect", () => {
        isMqttReady = true;
        console.log("[MQTT] Conectado");
        mqttClient.subscribe(TOPICS.state, { qos: 1 }, (err) => {
            if (err) console.error("Suscripción falló:", err);
        });
    });

    mqttClient.on("reconnect", () => console.log("[MQTT] Reintentando..."));
    mqttClient.on("error", (e) => console.error("[MQTT] Error:", e?.message || e));
    mqttClient.on("close", () => { isMqttReady = false; });

    mqttClient.on("message", (topic, payload) => {
        if (topic !== TOPICS.state) return;
        const msg = payload.toString();
        const status = document.getElementById("led-status");
        if (!status) return;
        if (msg === "ON") status.innerHTML = '<span class="text-green-600 font-bold">LED: ON (Estado)</span>';
        if (msg === "OFF") status.innerHTML = '<span class="text-red-600 font-bold">LED: OFF (Estado)</span>';
        logToFirestore(`STATE=${msg}`, "mqtt_state"); // opcional
    });
}
if (!mqttClient) connectMqtt();

// ========= API llamada desde Control.razor =========
window.toggleLed = async (state) => {
    const s = document.getElementById("led-status");
    if (s) s.innerHTML = state === "ON"
        ? '<span class="text-yellow-600">Enviando ON...</span>'
        : '<span class="text-blue-600">Enviando OFF...</span>';

    if (!isMqttReady) {
        if (s) s.innerHTML = '<span class="text-red-800 font-bold">MQTT no conectado</span>';
        return;
    }

    mqttClient.publish(TOPICS.cmd, state, { qos: 1, retain: false }, (err) => {
        if (err) s && (s.innerHTML = '<span class="text-red-800 font-bold">Error publicando</span>');
        else s && (s.innerHTML = '<span class="text-gray-700">Comando enviado: ' + state + '</span>');
    });

    logToFirestore(`CMD=${state}`, "mqtt_cmd"); // opcional
};

// ========= Tabla de logs Firestore (opcional) =========
window.startDatabaseListener = () => {
    if (!db || !isAuthReady) return;
    const q = getPublicCollectionRef("led_logs").orderBy("created_at", "desc");

    q.onSnapshot((snap) => {
        const tb = document.getElementById("data-table-body");
        if (!tb) return;
        let html = "";
        snap.forEach((d) => {
            const log = d.data(), id = d.id.substring(0, 5);
            html += `
        <tr class="bg-white border-b hover:bg-gray-50">
          <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">${id}</td>
          <td class="px-6 py-4">${log.device_id || "N/A"}</td>
          <td class="px-6 py-4">${log.action || "N/A"}</td>
          <td class="px-6 py-4">${log.source || "N/A"}</td>
          <td class="px-6 py-4">${log.created_at || "N/A"}</td>
        </tr>`;
        });
        tb.innerHTML = html;
    }, (err) => {
        console.error("Firestore listen error:", err);
        const tb = document.getElementById("data-table-body");
        if (tb) tb.innerHTML =
            '<tr><td colspan="5" class="px-6 py-4 text-center text-red-600">Error al cargar datos.</td></tr>';
    });
};
