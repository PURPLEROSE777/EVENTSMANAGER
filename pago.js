document.addEventListener('DOMContentLoaded', () => {
  const pago = JSON.parse(localStorage.getItem('pagoPendiente'));
  const resumen = document.getElementById('resumenPago');
  const formulario = document.getElementById('formularioPago');
  const metodo = document.getElementById('metodo');
  const datosBancarios = document.getElementById('datosBancarios');
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  const eventos = JSON.parse(localStorage.getItem('eventos')) || [];

  if (!user || user.tipo !== 'asistente') {
    alert("Debes estar logueado como asistente para acceder a la zona de pago.");
    window.location.href = "login.html";
    return;
  }

  if (!pago || !pago.eventName || !pago.cantidad || !pago.total) {
    resumen.innerHTML = "<p style='color:red;'>No hay datos de compra.</p>";
    formulario.style.display = "none";
    return;
  }

  const evento = eventos.find(e => e.name === pago.eventName);
  if (!evento) {
    resumen.innerHTML = "<p style='color:red;'>El evento ya no existe.</p>";
    formulario.style.display = "none";
    return;
  }

  const reservas = JSON.parse(localStorage.getItem("reservas")) || [];
  const reservados = reservas
    .filter(r => r.eventName === pago.eventName)
    .reduce((acc, r) => acc + r.cantidad, 0);

  const disponibles = evento.capacity - reservados;
  if (pago.cantidad > disponibles) {
    resumen.innerHTML = `
      <p style="color:red;">No hay suficientes entradas disponibles.</p>
      <p><strong>Disponibles:</strong> ${disponibles}</p>
    `;
    formulario.style.display = "none";
    return;
  }

  resumen.innerHTML = `
    <p><strong>Evento:</strong> ${pago.eventName}</p>
    <p><strong>Cantidad de Tickets:</strong> ${pago.cantidad}</p>
    <p><strong>Precio por ticket:</strong> $${pago.precioUnitario.toLocaleString()}</p>
    <p><strong>Total a pagar:</strong> <span style="color:green;">$${pago.total.toLocaleString()}</span></p>
  `;

  metodo.addEventListener("change", () => {
    const metodoSeleccionado = metodo.value;
    datosBancarios.innerHTML = "";

    if (metodoSeleccionado === "pse") {
      datosBancarios.innerHTML = `
        <label>Banco:</label><input type="text" required />
        <label>Número de cuenta:</label><input type="text" pattern="\\d{10,}" required />
        <label>Tipo de cuenta:</label>
        <select required>
          <option value="">--Selecciona--</option>
          <option value="ahorros">Ahorros</option>
          <option value="corriente">Corriente</option>
        </select>
        <label>Nombre del titular:</label><input type="text" required />
        <label>Cédula:</label><input type="text" pattern="\\d{6,}" required />
      `;
    } else if (metodoSeleccionado === "tarjeta") {
      datosBancarios.innerHTML = `
        <label>Número de tarjeta:</label><input type="text" pattern="\\d{16}" required />
        <label>Nombre del titular:</label><input type="text" required />
        <label>Fecha de vencimiento:</label><input type="month" required />
        <label>CVV:</label><input type="text" pattern="\\d{3}" required />
      `;
    } else if (metodoSeleccionado === "efecty") {
      datosBancarios.innerHTML = `
        <label>Nombre del remitente:</label><input type="text" required />
        <label>Cédula:</label><input type="text" pattern="\\d{6,}" required />
        <p style="margin-top:10px;">Recibirás un código para pagar en puntos Efecty.</p>
      `;
    }
  });

  formulario.addEventListener("submit", e => {
    e.preventDefault();

    if (!metodo.value) {
      alert("Selecciona un método de pago.");
      return;
    }

    const nuevasReservas = JSON.parse(localStorage.getItem("reservas")) || [];

    // Nueva reserva con nombre de evento como clave
    nuevasReservas.push({
      eventName: pago.eventName,
      cantidad: pago.cantidad,
      email: user.email,
      timestamp: new Date().toISOString()
    });

    localStorage.setItem("reservas", JSON.stringify(nuevasReservas));

    // Eliminar reserva pendiente
    localStorage.removeItem("pagoPendiente");

    alert("✅ Pago realizado con éxito. Tus tickets han sido reservados.");
    window.location.href = "tickets.html";
  });
});
