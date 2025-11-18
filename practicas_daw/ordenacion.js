document.addEventListener('DOMContentLoaded', function () {
  const seccionResultados = document.getElementById('resultados-busqueda');
  const campoSelect = document.getElementById('orden-campo');
  const direccionSelect = document.getElementById('orden-direccion');
  const btnOrdenar = document.getElementById('btn-ordenar');

  // guarda los fieldsets originales en un array
  const anuncios = Array.from(seccionResultados.querySelectorAll('fieldset'));

  btnOrdenar.addEventListener('click', function () {
    const campo = campoSelect.value;      // titulo, fecha, ciudad, pais, precio
    const direccion = direccionSelect.value; // asc o desc

    const anunciosOrdenados = [...anuncios].sort(function (a, b) {
      const valorA = obtenerValor(a, campo);
      const valorB = obtenerValor(b, campo);

      if (campo === 'fecha' || campo === 'precio') {
        // numérico
        if (valorA < valorB) return -1;
        if (valorA > valorB) return 1;
        return 0;
      } else {
        // texto
        return valorA.localeCompare(valorB, 'es', { sensitivity: 'base' });
      }
    });

    if (direccion === 'desc') {
      anunciosOrdenados.reverse();
    }

    anunciosOrdenados.forEach(function (anuncio) {
      seccionResultados.appendChild(anuncio);
    });
  });



  function obtenerValor(fieldset, campo) {
    switch (campo) {
      case 'titulo':
        return fieldset.querySelector('legend').textContent.trim().toLowerCase();
      case 'fecha':
        return parsearFecha(getTextoDL(fieldset, 'Fecha'));
      case 'ciudad':
        return getTextoDL(fieldset, 'Ciudad').toLowerCase();
      case 'pais':
        return getTextoDL(fieldset, 'País').toLowerCase();
      case 'precio':
        return parsearPrecio(getTextoDL(fieldset, 'Precio'));
      default:
        return '';
    }
  }

  function getTextoDL(fieldset, etiquetaDt) {
    const dts = fieldset.querySelectorAll('dt');
    for (let i = 0; i < dts.length; i++) {
      if (dts[i].textContent.trim().startsWith(etiquetaDt)) {
        const dd = dts[i].nextElementSibling;
        return dd ? dd.textContent.trim() : '';
      }
    }
    return '';
  }

  // fecha en formato dd/mm/aaaa -> número (timestamp)
  function parsearFecha(textoFecha) {
    const partes = textoFecha.split('/');
    if (partes.length !== 3) return 0;
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1; 
    const anio = parseInt(partes[2], 10);
    const fecha = new Date(anio, mes, dia);
    return fecha.getTime();
  }

  // conversion de precio
  function parsearPrecio(textoPrecio) {
    if (!textoPrecio) return 0;
    
    let limpio = textoPrecio.replace(/[^\d.,]/g, '');
    limpio = limpio.replace(/\./g, '');
    limpio = limpio.replace(',', '.');

    const num = parseFloat(limpio);
    return isNaN(num) ? 0 : num;
  }
});
