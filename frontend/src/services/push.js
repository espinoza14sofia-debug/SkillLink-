import api from "./api";

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export async function suscribirseAPush() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.warn("Este navegador no soporta notificaciones push.");
        return false;
    }

    const permiso = await Notification.requestPermission();
    if (permiso !== "granted") {
        return false;
    }

    const registro = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    const { data } = await api.get("/push/clave-publica");
    const clavePublica = data.clavePublica;

    let suscripcion = await registro.pushManager.getSubscription();
    if (!suscripcion) {
        suscripcion = await registro.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(clavePublica),
        });
    }

    const suscripcionJson = suscripcion.toJSON();

    await api.post("/push/suscribirse", {
        endpoint: suscripcionJson.endpoint,
        keys: {
            p256dh: suscripcionJson.keys.p256dh,
            auth: suscripcionJson.keys.auth,
        },
    });

    return true;
}

export async function desuscribirseDePush() {
    if (!("serviceWorker" in navigator)) return;

    const registro = await navigator.serviceWorker.getRegistration();
    if (!registro) return;

    const suscripcion = await registro.pushManager.getSubscription();
    if (!suscripcion) return;

    const endpoint = suscripcion.endpoint;
    await suscripcion.unsubscribe();
    await api.delete(`/push/desuscribirse?endpoint=${encodeURIComponent(endpoint)}`);
}