// Variante estricta: a diferencia de login.js, aquí NO se eliminan espacios/tabulaciones.
// Si el usuario o la contraseña contienen cualquier whitespace (espacio, tab, salto de línea), se bloquea el acceso.
// No enlazado en ninguna página: archivo opcional para tener ambas opciones.

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-login');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value; // no se sanitiza
    const password = document.getElementById('password').value; // no se sanitiza
    const recordar = document.getElementById('recordar') ? document.getElementById('recordar').checked : false;

    const errores = [];

    // Rechazar si hay cualquier whitespace
    if (/\s/.test(usuario)) errores.push('El usuario contiene espacios o tabulaciones: no permitido.');
    if (/\s/.test(password)) errores.push('La contraseña contiene espacios o tabulaciones: no permitido.');

    // Validación del usuario: empieza por letra, 3-15, solo letras y números
    const regUsuario = /^[A-Za-z][A-Za-z0-9]{2,14}$/;
    if (!regUsuario.test(usuario)) {
      errores.push('El usuario debe empezar por letra y tener entre 3 y 15 caracteres (solo letras y números).');
    }

    // Validar contraseña: 6-15, solo letras, números, _ o -, y al menos mayúscula, minúscula y número
    const regFormatoClave = /^[A-Za-z0-9_-]{6,15}$/;
    if (!regFormatoClave.test(password)) {
      errores.push('La contraseña debe tener entre 6 y 15 caracteres y solo puede contener letras, números, guion y guion bajo.');
    } else {
      if (!/[A-Z]/.test(password)) errores.push('La contraseña debe contener al menos una letra mayúscula.');
      if (!/[a-z]/.test(password)) errores.push('La contraseña debe contener al menos una letra minúscula.');
      if (!/[0-9]/.test(password)) errores.push('La contraseña debe contener al menos un número.');
    }

    if (errores.length > 0) {
      alert(errores.join('\n'));
      return;
    }

    setCookie('usuario', encodeURIComponent(usuario), recordar ? 30 : null);
    setCookie('logueado', 'true', recordar ? 30 : null);
    setCookie('ultima_visita', new Date().toISOString(), recordar ? 30 : null);

    window.location.href = 'cuenta.html';
  });

  function setCookie(name, value, days) {
    var cookie = name + '=' + value + '; path=/';
    if (days && Number(days) > 0) {
      var d = new Date();
      d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
      cookie += '; expires=' + d.toUTCString();
    }
    document.cookie = cookie;
  }

  window.getCookie = function (name) {
    var match = document.cookie.split('; ').find(function (row) { return row.startsWith(name + '='); });
    return match ? decodeURIComponent(match.split('=')[1]) : null;
  };

  window.deleteCookie = function (name) {
    document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };
});
