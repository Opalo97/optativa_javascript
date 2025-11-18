document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-registro');
  const divErrores = document.getElementById('errores');

  form.addEventListener('submit', function (event) {
    const errores = [];

    // obtener valores y recortar espacios
    const usuario = document.getElementById('usuario').value.trim();
    const clave = document.getElementById('clave').value;
    const clave2 = document.getElementById('clave2').value;
    const email = document.getElementById('email').value.trim();
    const sexo = document.querySelector('input[name="sexo"]:checked');
    const fecha = document.getElementById('fecha').value.trim();
    const ciudad = document.getElementById('ciudad').value.trim();
    const pais = document.getElementById('pais').value;
    const foto = document.getElementById('foto').value;

    // validar nombre de usuario

    const regUsuario = /^[A-Za-z][A-Za-z0-9]{2,14}$/;
    if (!regUsuario.test(usuario)) {
      errores.push(
        'El nombre de usuario debe tener entre 3 y 15 caracteres, ' +
        'empezar por una letra y solo contener letras y números.'
      );
    }

    // validar contraseña

    const regFormatoClave = /^[A-Za-z0-9_-]{6,15}$/;
    if (!regFormatoClave.test(clave)) {
      errores.push(
        'La contraseña debe tener entre 6 y 15 caracteres y solo puede ' +
        'contener letras, números, guion y guion bajo.'
      );
    } else {
      if (!/[A-Z]/.test(clave)) {
        errores.push('La contraseña debe contener al menos una letra mayúscula.');
      }
      if (!/[a-z]/.test(clave)) {
        errores.push('La contraseña debe contener al menos una letra minúscula.');
      }
      if (!/[0-9]/.test(clave)) {
        errores.push('La contraseña debe contener al menos un número.');
      }
    }

    // comprobar repetir contraseña
    if (clave !== clave2) {
      errores.push('Las contraseñas no coinciden.');
    }

    // validar email 

    if (email === '') {
      errores.push('La dirección de correo electrónico no puede estar vacía.');
    } else {
      if (email.length > 254) {
        errores.push('La longitud máxima de una dirección de correo es 254 caracteres.');
      }

      const partes = email.split('@');
      if (partes.length !== 2) {
        errores.push('El correo debe tener el formato parte-local@dominio.');
      } else {
        const parteLocal = partes[0];
        const dominio = partes[1];

        // longitudes de parte-local y dominio
        if (parteLocal.length < 1 || parteLocal.length > 64) {
          errores.push(
            'La parte local del correo debe tener entre 1 y 64 caracteres.'
          );
        }
        if (dominio.length < 1 || dominio.length > 255) {
          errores.push(
            'El dominio del correo debe tener entre 1 y 255 caracteres.'
          );
        }

        // expresion regular para parte-local
        
        const regParteLocal =
          /^(?:[A-Za-z0-9!#$%&'*+\-/=?^_`{|}~]+(?:\.[A-Za-z0-9!#$%&'*+\-/=?^_`{|}~]+)*)$/;

        if (!regParteLocal.test(parteLocal)) {
          errores.push(
            'La parte local del correo no cumple el formato permitido.'
          );
        }

        // validar dominio:
        
        const subdominios = dominio.split('.');
        if (subdominios.some(sd => sd.length === 0)) {
          errores.push('El dominio no puede tener puntos seguidos ni empezar ni acabar en punto.');
        } else {
          const regSubdominio =
            /^(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)$/;
          subdominios.forEach(sd => {
            if (sd.length > 63) {
              errores.push(
                'Cada subdominio del correo debe tener como máximo 63 caracteres.'
              );
            }
            if (!regSubdominio.test(sd)) {
              errores.push(
                'El dominio del correo solo puede contener letras, números y guiones, ' +
                'y el guion no puede ir al principio ni al final del subdominio.'
              );
            }
          });
        }
      }
    }

    // comprobaciones básicas del resto de campos 
    if (!sexo) {
      errores.push('Debes seleccionar el sexo.');
    }

    if (fecha === '') {
      errores.push('Debes introducir la fecha de nacimiento.');
    }

    if (ciudad === '') {
      errores.push('Debes introducir la ciudad de residencia.');
    }

    if (pais === '') {
      errores.push('Debes seleccionar un país de residencia.');
    }

    if (foto === '') {
      errores.push('Debes seleccionar una foto de perfil.');
    }

    // mostrar errores o permitir el envio
    if (errores.length > 0) {
      event.preventDefault(); // bloquear envio

      // mostrar los errores
      divErrores.innerHTML = '';
      const ul = document.createElement('ul');
      errores.forEach(function (msg) {
        const li = document.createElement('li');
        li.textContent = msg;
        ul.appendChild(li);
      });
      divErrores.appendChild(ul);

      
      divErrores.focus();
    } else {
      // no hay errores: se envia el formulario 
      
    }
  });
});
