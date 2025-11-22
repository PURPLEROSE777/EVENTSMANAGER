document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user || !user.tipo) {
    alert("Debes iniciar sesión para acceder.");
    window.location.href = "login.html";
    return;
  }

  // Mostrar código de privilegio si es STAFF
  if (user.tipo === "staff") {
    document.getElementById("codigoPanel")?.classList.remove("hidden");

    const asignaciones = JSON.parse(localStorage.getItem("asignacionesStaff")) || [];
    const asignado = asignaciones.find(a => a.email === user.email);

    if (asignado) {
      document.getElementById("staffStandNombre").textContent = asignado.stand;
      document.getElementById("staffStandEvento").textContent = asignado.evento;
      document.getElementById("staffDescripcionNueva").value =
        obtenerDescripcionDeStand(asignado.stand, asignado.evento);
      document.getElementById("staffEditPanel")?.classList.remove("hidden");
    }
  }

  // Ocultar herramientas si no es gestor
  if (user.tipo !== "gestor") {
    ["nuevoStandBtn", "standFormPanel", "privilegeCodeField"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add("hidden");
    });
  }

  cargarEventosEnSelect();
  renderizarStands();
});

// === Referencias
const nuevoStandBtn = document.getElementById("nuevoStandBtn");
const guardarStandBtn = document.getElementById("guardarStandBtn");
const standFormPanel = document.getElementById("standFormPanel");
const gestionLayout = document.getElementById("gestionLayout");
const standListContainer = document.getElementById("standListContainer");

const standNombre = document.getElementById("standNombre");
const standTipo = document.getElementById("standTipo");
const standDescripcion = document.getElementById("standDescripcion");
const standEvento = document.getElementById("standEvento");
const standPrivilegio = document.getElementById("standPrivilegio");

let editIndex = null;

// === Crear o editar stand (GESTOR)
if (nuevoStandBtn && guardarStandBtn) {
  nuevoStandBtn.addEventListener("click", () => abrirFormulario());

  guardarStandBtn.addEventListener("click", () => {
    const nombre = standNombre.value.trim();
    const tipo = standTipo.value.trim();
    const descripcion = standDescripcion.value.trim();
    const evento = standEvento.value;
    const privilegio = standPrivilegio?.value.trim().toUpperCase();

    if (!nombre || !tipo || !descripcion || !evento) {
      alert("Completa todos los campos.");
      return;
    }

    if (!/^[A-Z0-9]{8}$/.test(privilegio)) {
      alert("Código de privilegio inválido (8 caracteres alfanuméricos).");
      return;
    }

    const nuevoStand = { nombre, tipo, descripcion, evento, privilegio };
    const stands = obtenerStands();

    if (editIndex !== null) {
      stands[editIndex] = nuevoStand;
    } else {
      stands.push(nuevoStand);
    }

    localStorage.setItem("stands", JSON.stringify(stands));
    cerrarFormularioStand();
    renderizarStands();
  });
}

// === Renderizado
function renderizarStands() {
  const stands = obtenerStands();
  const asignaciones = JSON.parse(localStorage.getItem("asignacionesStaff")) || [];
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  standListContainer.innerHTML = "";

  if (stands.length === 0) {
    standListContainer.innerHTML = "<p>No hay stands registrados aún.</p>";
    return;
  }

  stands.forEach((stand, index) => {
    const card = document.createElement("div");
    card.classList.add("ticket-card");

    const miembros = asignaciones.filter(a => a.stand === stand.nombre && a.evento === stand.evento);

    let html = `
      <h4 style="color:#2c003e;">${stand.nombre}</h4>
      <p><strong>Tipo:</strong> ${stand.tipo}</p>
      <p><strong>Descripción:</strong> ${stand.descripcion}</p>
      <p><strong>Evento:</strong> ${stand.evento}</p>
    `;

    if (user.tipo === "gestor") {
      html += `<p><strong>Código de privilegio:</strong> ${stand.privilegio}</p>`;
    }

    if (miembros.length > 0) {
      html += `<p><strong>Miembros asignados:</strong></p><ul>`;
      miembros.forEach(m => {
        html += `<li>${m.email}</li>`;
      });
      html += `</ul>`;
    }

    html += `<div style="margin-top:10px; display:flex; gap:10px;">`;

    if (user.tipo === "gestor") {
      html += `
        <button class="btn-gold" onclick="editarStand(${index})">✏️ Editar</button>
        <button class="btn" onclick="eliminarStand(${index})">🗑️ Eliminar</button>
      `;
    }

    if (user.tipo === "staff") {
      const asignado = miembros.find(m => m.email === user.email);
      if (asignado) {
        html += `<button class="btn" onclick="cancelarInscripcion()">❌ Cancelar Inscripción</button>`;
      }
    }

    html += `</div>`;
    card.innerHTML = html;
    standListContainer.appendChild(card);
  });
}

// === Utilidades
function obtenerStands() {
  return JSON.parse(localStorage.getItem("stands")) || [];
}

function abrirFormulario(stand = null, index = null) {
  standFormPanel.classList.remove("hidden");
  gestionLayout.classList.add("expand-layout");
  editIndex = index;

  standNombre.value = stand?.nombre || "";
  standTipo.value = stand?.tipo || "";
  standDescripcion.value = stand?.descripcion || "";
  standEvento.value = stand?.evento || "";
  standPrivilegio.value = stand?.privilegio || "";
}

function cerrarFormularioStand() {
  standFormPanel.classList.add("hidden");
  gestionLayout.classList.remove("expand-layout");
  standNombre.value = "";
  standTipo.value = "";
  standDescripcion.value = "";
  standEvento.value = "";
  standPrivilegio.value = "";
  editIndex = null;
}

function cargarEventosEnSelect() {
  const eventos = JSON.parse(localStorage.getItem("eventos")) || [];
  standEvento.innerHTML = `<option value="">Seleccione un evento</option>`;
  eventos.forEach(evento => {
    const option = document.createElement("option");
    option.value = evento.name;
    option.textContent = evento.name;
    standEvento.appendChild(option);
  });
}

// === Gestor: editar / eliminar
window.editarStand = function(index) {
  const stands = obtenerStands();
  abrirFormulario(stands[index], index);
};

window.eliminarStand = function(index) {
  if (!confirm("¿Eliminar este stand?")) return;
  const stands = obtenerStands();
  stands.splice(index, 1);
  localStorage.setItem("stands", JSON.stringify(stands));
  renderizarStands();
};

// === STAFF: cancelar inscripción
window.cancelarInscripcion = function () {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  let asignaciones = JSON.parse(localStorage.getItem("asignacionesStaff")) || [];
  asignaciones = asignaciones.filter(a => a.email !== user.email);
  localStorage.setItem("asignacionesStaff", JSON.stringify(asignaciones));
  alert("Has cancelado tu inscripción al stand.");
  location.reload();
};

// === STAFF: código de privilegio
window.verificarCodigoPrivilegio = function () {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const codeInput = document.getElementById("inputCodigoPrivilegio");
  const resultado = document.getElementById("resultadoCodigo");
  const codigo = codeInput.value.trim().toUpperCase();

  if (!/^[A-Z0-9]{8}$/.test(codigo)) {
    resultado.textContent = "Código inválido.";
    resultado.style.color = "red";
    return;
  }

  const asignaciones = JSON.parse(localStorage.getItem("asignacionesStaff")) || [];
  if (asignaciones.find(a => a.email === user.email)) {
    resultado.textContent = "Ya estás asignado a un stand.";
    resultado.style.color = "orange";
    return;
  }

  const stands = obtenerStands();
  const stand = stands.find(s => s.privilegio === codigo);
  if (!stand) {
    resultado.textContent = "Código incorrecto.";
    resultado.style.color = "red";
    return;
  }

  asignaciones.push({ email: user.email, stand: stand.nombre, evento: stand.evento, timestamp: new Date().toISOString() });
  localStorage.setItem("asignacionesStaff", JSON.stringify(asignaciones));

  resultado.innerHTML = `✅ Asignado a <strong>${stand.nombre}</strong> - <strong>${stand.evento}</strong><br>📩 Recibirás un ticket en tu correo.`;
  resultado.style.color = "green";
  codeInput.disabled = true;

  document.getElementById("staffStandNombre").textContent = stand.nombre;
  document.getElementById("staffStandEvento").textContent = stand.evento;
  document.getElementById("staffDescripcionNueva").value = stand.descripcion;
  document.getElementById("staffDescripcionNueva").disabled = true;
  document.getElementById("btnGuardarStaffDesc").classList.add("hidden");
  document.getElementById("btnCancelarEdicion").classList.add("hidden");
  document.getElementById("staffEditPanel").classList.remove("hidden");

  renderizarStands();
};

// === STAFF: editar descripción
window.guardarDescripcionStaff = function () {
  const nuevaDesc = document.getElementById("staffDescripcionNueva").value.trim();
  const resultado = document.getElementById("staffGuardarResultado");
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const asignaciones = JSON.parse(localStorage.getItem("asignacionesStaff")) || [];
  const asignado = asignaciones.find(a => a.email === user.email);

  if (!nuevaDesc || nuevaDesc.length < 5) {
    resultado.textContent = "Debe tener al menos 5 caracteres.";
    resultado.style.color = "red";
    return;
  }

  const stands = obtenerStands();
  const index = stands.findIndex(s => s.nombre === asignado.stand && s.evento === asignado.evento);
  if (index !== -1) {
    stands[index].descripcion = nuevaDesc;
    localStorage.setItem("stands", JSON.stringify(stands));
    resultado.textContent = "✅ Descripción actualizada.";
    resultado.style.color = "green";
    renderizarStands();
  } else {
    resultado.textContent = "No se encontró el stand.";
    resultado.style.color = "red";
  }
};

function obtenerDescripcionDeStand(nombre, evento) {
  const stands = obtenerStands();
  const s = stands.find(s => s.nombre === nombre && s.evento === evento);
  return s ? s.descripcion : "";
}

// Añadir lógica de edición controlada por botón y mensaje de confirmación
window.habilitarEdicionStaff = function () {
  document.getElementById("staffDescripcionNueva").disabled = false;
  document.getElementById("btnGuardarStaffDesc").classList.remove("hidden");
  document.getElementById("btnCancelarEdicion").classList.remove("hidden");
};

window.cancelarEdicionStaff = function () {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const asignaciones = JSON.parse(localStorage.getItem("asignacionesStaff")) || [];
  const asignado = asignaciones.find(a => a.email === user.email);
  document.getElementById("staffDescripcionNueva").value =
    obtenerDescripcionDeStand(asignado.stand, asignado.evento);
  document.getElementById("staffDescripcionNueva").disabled = true;
  document.getElementById("btnGuardarStaffDesc").classList.add("hidden");
  document.getElementById("btnCancelarEdicion").classList.add("hidden");
};