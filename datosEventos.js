// === Referencias ===
const newEventBtn = document.getElementById('newEventBtn');
const saveEventBtn = document.getElementById('saveEventBtn');
const eventListContainer = document.getElementById('eventListContainer');
const formPanel = document.getElementById('formPanel');
const gestionLayout = document.getElementById('gestionLayout');

const eventName = document.getElementById('eventName');
const eventDate = document.getElementById('eventDate');
const eventLocation = document.getElementById('eventLocation');
const eventCapacity = document.getElementById('eventCapacity');
const eventPrice = document.getElementById('eventPrice'); // NUEVO CAMPO

let editIndex = null;

// === Validación de acceso solo para gestores ===
document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!user || user.tipo !== 'gestor') {
    alert('Acceso restringido. Solo para gestores.');
    window.location.href = 'login.html';
    return;
  }

  renderEvents();
});

// === Mostrar panel de formulario ===
newEventBtn.addEventListener('click', () => {
  openForm();
});

// === Guardar evento ===
saveEventBtn.addEventListener('click', () => {
  const name = eventName.value.trim();
  const date = eventDate.value;
  const location = eventLocation.value.trim();
  const capacity = parseInt(eventCapacity.value);
  const price = parseInt(eventPrice.value); // NUEVO

  if (!name || !date || !location || isNaN(capacity) || isNaN(price)) {
    alert('Por favor, completa todos los campos correctamente.');
    return;
  }

  const newEvent = { name, date, location, capacity, precio: price };
  const events = getEvents();

  if (editIndex !== null) {
    events[editIndex] = newEvent;
    editIndex = null;
  } else {
    events.push(newEvent);
  }

  localStorage.setItem('eventos', JSON.stringify(events));
  renderEvents();
  closeForm();
});

// === Abrir formulario ===
function openForm(event = null, index = null) {
  formPanel.classList.remove('hidden');
  gestionLayout.classList.add('expand-layout');

  if (event) {
    eventName.value = event.name;
    eventDate.value = event.date;
    eventLocation.value = event.location;
    eventCapacity.value = event.capacity;
    eventPrice.value = event.precio || 10000;
    editIndex = index;
  } else {
    eventName.value = '';
    eventDate.value = '';
    eventLocation.value = '';
    eventCapacity.value = '';
    eventPrice.value = '10000';
    editIndex = null;
  }
}

// === Cerrar formulario ===
function closeForm() {
  formPanel.classList.add('hidden');
  gestionLayout.classList.remove('expand-layout');
  eventName.value = '';
  eventDate.value = '';
  eventLocation.value = '';
  eventCapacity.value = '';
  eventPrice.value = '';
  editIndex = null;
}

// === Obtener eventos de localStorage ===
function getEvents() {
  return JSON.parse(localStorage.getItem('eventos')) || [];
}

// === Renderizar eventos ===
function renderEvents() {
  const events = getEvents();
  eventListContainer.innerHTML = '';

  if (events.length === 0) {
    eventListContainer.innerHTML = '<p>No hay eventos guardados.</p>';
    return;
  }

  events.forEach((event, index) => {
    const card = document.createElement('div');
    card.classList.add('ticket-card');

    card.innerHTML = `
      <h4 style="color:#2c003e;">${event.name}</h4>
      <p><strong>Fecha:</strong> ${event.date}</p>
      <p><strong>Ubicación:</strong> ${event.location}</p>
      <p><strong>Capacidad:</strong> ${event.capacity}</p>
      <p><strong>Precio por ticket:</strong> $${event.precio?.toLocaleString() || 'No especificado'}</p>
      <div style="margin-top:10px; display:flex; gap:10px;">
        <button class="btn-gold" onclick="editEvent(${index})">✏️ Editar</button>
        <button class="btn" onclick="deleteEvent(${index})">🗑️ Eliminar</button>
      </div>
    `;

    eventListContainer.appendChild(card);
  });
}

// === Editar evento ===
window.editEvent = function(index) {
  const events = getEvents();
  openForm(events[index], index);
};

// === Eliminar evento ===
window.deleteEvent = function(index) {
  if (!confirm('¿Estás seguro de eliminar este evento?')) return;
  const events = getEvents();
  events.splice(index, 1);
  localStorage.setItem('eventos', JSON.stringify(events));
  renderEvents();
};
