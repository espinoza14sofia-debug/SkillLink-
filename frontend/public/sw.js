self.addEventListener('push', (event) => {
    if (!event.data) return;

    let payload;
    try {
        payload = event.data.json();
    } catch {
        payload = { titulo: 'SkillLink', mensaje: event.data.text() };
    }

    const titulo = payload.titulo || 'SkillLink';
    const opciones = {
        body: payload.mensaje || '',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
    };

    event.waitUntil(self.registration.showNotification(titulo, opciones));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            if (clientList.length > 0) {
                return clientList[0].focus();
            }
            return clients.openWindow('/');
        })
    );
});