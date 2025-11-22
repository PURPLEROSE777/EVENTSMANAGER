document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('eventTicketsContainer');
  const events = JSON.parse(localStorage.getItem('eventos')) || [];
  const reservas = JSON.parse(localStorage.getItem('reservas')) || [];
  const user = JSON.parse(localStorage.getItem('loggedInUser'));

  if (!user || user.tipo !== "asistente") {
    container.innerHTML = "<p style='color:red;'>Solo los asistentes pueden reservar tickets.</p>";
    return;
  }

  if (events.length === 0) {
    container.innerHTML = "<p>No hay eventos disponibles.</p>";
    return;
  }

  events.forEach((event) => {
    const reservados = reservas
      .filter(r => r.eventName === event.name)
      .reduce((acc, r) => acc + r.cantidad, 0);

    const disponibles = event.capacity - reservados;
    const precio = event.precio || 10000; // Por defecto 10.000 si no se definió precio

    const div = document.createElement('div');
    div.classList.add('ticket-card');

    if (disponibles <= 0) {
      div.innerHTML = `
        <h3>${event.name}</h3>
        <p><strong>Fecha:</strong> ${event.date}</p>
        <p><strong>Ubicación:</strong> ${event.location}</p>
        <p><strong>Capacidad:</strong> ${event.capacity}</p>
        <p><strong>Disponibles:</strong> 0</p>
        <p style="color: red; font-weight: bold;">🎟️ Evento agotado</p>
      `;
    } else {
      div.innerHTML = `
        <h3>${event.name}</h3>
        <p><strong>Fecha:</strong> ${event.date}</p>
        <p><strong>Ubicación:</strong> ${event.location}</p>
        <p><strong>Capacidad:</strong> ${event.capacity}</p>
        <p><strong>Disponibles:</strong> ${disponibles}</p>
        <p><strong>Precio por ticket:</strong> $${precio.toLocaleString()}</p>
        <label for="tickets-${event.name}">Cantidad de Tickets:</label>
        <input type="number" id="tickets-${event.name}" min="1" max="${disponibles}" />
        <button class="btn" onclick="iniciarPago('${event.name}')">Reservar</button>
      `;
    }

    container.appendChild(div);
  });
});

function iniciarPago(eventName) {
  const input = document.getElementById(`tickets-${eventName}`);
  const cantidad = parseInt(input.value);

  if (!cantidad || cantidad <= 0) {
    alert("Ingresa una cantidad válida.");
    return;
  }

  const eventos = JSON.parse(localStorage.getItem('eventos')) || [];
  const evento = eventos.find(e => e.name === eventName);
  if (!evento) {
    alert("Evento no encontrado.");
    return;
  }

  const reservas = JSON.parse(localStorage.getItem('reservas')) || [];
  const reservados = reservas
    .filter(r => r.eventName === eventName)
    .reduce((acc, r) => acc + r.cantidad, 0);

  const disponibles = evento.capacity - reservados;
  if (cantidad > disponibles) {
    alert(`Solo quedan ${disponibles} tickets disponibles.`);
    return;
  }

  const precio = evento.precio || 10000;

  const pagoPendiente = {
    eventName,
    cantidad,
    precioUnitario: precio,
    total: cantidad * precio
  };

  localStorage.setItem("pagoPendiente", JSON.stringify(pagoPendiente));

  // Redirigir a zona de pagos
  window.location.href = "pago.html";
}
