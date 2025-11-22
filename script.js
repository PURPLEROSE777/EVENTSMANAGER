// Usuarios por defecto con tipo de cuenta
const defaultUsers = [
  { email: "usuario@example.com", password: "123456", tipo: "asistente" },
  { email: "admin@example.com", password: "admin123", tipo: "gestor" }
];

// Base de datos simulada
let usersDB = JSON.parse(localStorage.getItem("usersDB")) || defaultUsers;

// Registro invisible de actividad
function registrarHistorial(email, tipo, accion) {
  const historial = JSON.parse(localStorage.getItem("historialAccesos")) || [];
  const fecha = new Date().toLocaleString();
  historial.push({ email, tipo, fecha, accion });
  localStorage.setItem("historialAccesos", JSON.stringify(historial));
}

// Logout global
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "home.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("form[action='#'], #loginForm");
  const registerForm = document.getElementById("registerForm");

  // === LOGIN ===
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const user = usersDB.find(u => u.email === email && u.password === password);

      if (user) {
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        registrarHistorial(user.email, user.tipo, "login");

        // Redirección por tipo
        switch (user.tipo) {
          case "gestor":
            window.location.href = "gestionEventos.html";
            break;
          case "asistente":
            window.location.href = "home.html";
            break;
          case "staff":
            window.location.href = "espacios.html";
            break;
          default:
            window.location.href = "home.html";
        }
      } else {
        const errorBox = document.getElementById("loginError");
        if (errorBox) {
          errorBox.textContent = "❌ Correo o contraseña incorrectos.";
        } else {
          alert("Correo o contraseña incorrectos.");
        }
      }
    });
  }

  // === REGISTRO ===
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("newEmail").value.trim();
      const password = document.getElementById("newPassword").value.trim();
      const tipo = document.getElementById("newTipo").value;

      if (!email || !password || !tipo) {
        alert("Completa todos los campos.");
        return;
      }

      if (usersDB.find(u => u.email === email)) {
        alert("El correo ya está registrado.");
        return;
      }

      const nuevoUsuario = { email, password, tipo };
      usersDB.push(nuevoUsuario);
      localStorage.setItem("usersDB", JSON.stringify(usersDB));
      registrarHistorial(email, tipo, "registro");

      alert("Cuenta creada exitosamente. Ahora puedes iniciar sesión.");
      window.location.href = "login.html";
    });
  }

  // === PROTECCIÓN DE RUTAS ===
  const session = JSON.parse(localStorage.getItem("loggedInUser"));
  const path = window.location.pathname;

  if (path.includes("gestionEventos.html") && (!session || session.tipo !== "gestor")) {
    alert("Acceso restringido. Solo disponible para gestores.");
    window.location.href = "login.html";
  }

  // === CONTROL DE MENÚ SEGÚN ROL (opcional aquí si no está ya en cada HTML) ===
  if (session) {
    const tipo = session.tipo;

    if (tipo === "asistente") {
      ocultarElementos(["menu-gestion", "menu-espacios"]);
    } else if (tipo === "staff") {
      ocultarElementos(["menu-gestion", "menu-tickets"]);
    }
    // gestor: ve todo
  } else {
    // Sin sesión: ocultar herramientas
    ocultarElementos(["menu-gestion", "menu-tickets", "menu-espacios", "menu-inscripcion"]);
  }

  function ocultarElementos(ids) {
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
  }
});
