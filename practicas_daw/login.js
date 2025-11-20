document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-login');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value.trim();
    const password = document.getElementById('password').value;
    const recordar = document.getElementById('recordar').checked;

    const errores = [];

    // Validación del usuario (JS): empieza por letra, 3-15 caracteres
    // solo letras y números
    const regUsuario = /^[A-Za-z][A-Za-z0-9]{2,14}$/;
    if (!regUsuario.test(usuario)) {
      errores.push('El usuario debe empezar por letra y tener entre 3 y 15 caracteres (letras y números).');
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

    // Guardar cookies: 'usuario', 'logueado' y 'ultima_visita'
    // Si el usuario marca 'recordar', la cookie expirará en 30 días; si no, será de sesión.
    setCookie('usuario', encodeURIComponent(usuario), recordar ? 30 : null);
    setCookie('logueado', 'true', recordar ? 30 : null);
    setCookie('ultima_visita', new Date().toISOString(), recordar ? 30 : null);

    // Redirigir a la página de la cuenta
    window.location.href = 'cuenta.html';
  });

  function setCookie(name, value, days) {
    let cookie = name + '=' + value + '; path=/';
    if (days && Number(days) > 0) {
      const d = new Date();
      d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
      cookie += '; expires=' + d.toUTCString();
    }
    document.cookie = cookie;
  }

  // Helpers expuestos para uso en otras páginas
  // Obtener cookie por nombre (decodificada)
  window.getCookie = function (name) {
    const match = document.cookie.split('; ').find(row => row.startsWith(name + '='));
    return match ? decodeURIComponent(match.split('=')[1]) : null;
  };

  // Borrar cookie (fecha pasada)
  window.deleteCookie = function (name) {
    document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };
});
