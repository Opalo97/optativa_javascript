document.addEventListener('DOMContentLoaded', function () {
  // Helpers de cookies
  function setCookie(name, value, days) {
    let cookie = name + '=' + encodeURIComponent(value) + '; path=/';
    if (days && Number(days) > 0) {
      const d = new Date();
      d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
      cookie += '; expires=' + d.toUTCString();
    }
    document.cookie = cookie;
  }

  function getCookie(name) {
    const match = document.cookie.split('; ').find(row => row.startsWith(name + '='));
    return match ? decodeURIComponent(match.split('=')[1]) : null;
  }

  function deleteCookie(name) {
    document.cookie = name + '=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }

  // Encuentra todas las hojas con atributo title (estilos alternativos)
  const links = Array.from(document.getElementsByTagName('link')).filter(l => l.title && l.getAttribute('rel') && l.getAttribute('rel').indexOf('stylesheet') !== -1);

  // debug: listar títulos detectados
  console.debug('[estilos_cookies] estilos detectados:', links.map(l => l.title));

  // Crear selector y añadir al header si hay más de 1 estilo
  if (links.length > 0) {
    // determinar título por defecto (preferir 'Modo Claro')
    let defaultTitle = null;
    for (const l of links) {
      if (l.title && l.title.toLowerCase().includes('modo claro')) {
        defaultTitle = l.title;
        break;
      }
    }
    if (!defaultTitle) defaultTitle = links[0].title;
    const select = document.createElement('select');
    select.id = 'selector-estilos';
    select.setAttribute('aria-label', 'Seleccionar estilo');

    links.forEach(function (link, idx) {
      const opt = document.createElement('option');
      opt.value = link.title;
      opt.textContent = link.title;
      select.appendChild(opt);
    });

    // Insertar el selector en el header (dentro de .a_titulo si existe)
    const cont = document.querySelector('.a_titulo') || document.querySelector('header') || document.body;
    const wrapper = document.createElement('div');
    wrapper.className = 'selector-estilos-wrapper';
    const label = document.createElement('label');
    label.htmlFor = 'selector-estilos';
    label.textContent = 'Estilo: ';
    wrapper.appendChild(label);
    wrapper.appendChild(select);
    cont.appendChild(wrapper);

    // Aplicar estilo activo según cookie y consentimiento
    const consent = getCookie('consent');
    const estiloGuardado = getCookie('estilo');
    const estiloHref = getCookie('estilo_href');
    console.debug('[estilos_cookies] consent=', consent, 'estiloGuardado=', estiloGuardado, 'defaultTitle=', defaultTitle);
    if (consent === 'rejected') {
      // si rechaza cookies, asegurarse de aplicar el estilo por defecto
      applyStyle(defaultTitle);
      select.value = defaultTitle;
    } else if (consent === 'accepted' && estiloGuardado) {
      // si existe cookie con título, intentar aplicar
      if (!applyStyle(estiloGuardado)) {
        // si no coincide ningún title pero hay href almacenado, inyectar la hoja
        if (estiloHref) {
          const newLink = injectStyleLink(estiloGuardado, estiloHref);
          // actualizar lista de links si se inyectó
          if (newLink) links.push(newLink);
          applyStyle(estiloGuardado);
        }
      }
      // asegurarse de que el selector contiene la opción y la marca
      if (!Array.from(select.options).some(o => o.value === estiloGuardado)) {
        const opt = document.createElement('option'); opt.value = estiloGuardado; opt.textContent = estiloGuardado; select.appendChild(opt);
      }
      select.value = estiloGuardado;
    } else if (estiloGuardado && consent !== 'rejected') {
      // si hay estilo guardado y no está explícitamente rechazado, aplicarlo (no persiste si no hay consentimiento)
      if (!applyStyle(estiloGuardado) && estiloHref) {
        const newLink = injectStyleLink(estiloGuardado, estiloHref);
        if (newLink) links.push(newLink);
        applyStyle(estiloGuardado);
      }
      if (!Array.from(select.options).some(o => o.value === estiloGuardado)) {
        const opt = document.createElement('option'); opt.value = estiloGuardado; opt.textContent = estiloGuardado; select.appendChild(opt);
      }
      select.value = estiloGuardado;
    } else {
      // aplicar título por defecto (Modo Claro preferido)
      applyStyle(defaultTitle);
      select.value = defaultTitle;
    }

    select.addEventListener('change', function () {
      const chosen = String(select.value).trim();
      applyStyle(chosen);
      // si ha aceptado cookies, persistir 45 días
      if (getCookie('consent') === 'accepted') {
        // buscar href correspondiente
        const match = links.find(l => String(l.title).trim().toLowerCase() === chosen.toLowerCase());
        if (match && match.href) {
          setCookie('estilo', chosen, 45);
          setCookie('estilo_href', match.href, 45);
        } else {
          // si no hay match, eliminar href guardada
          setCookie('estilo', chosen, 45);
          deleteCookie('estilo_href');
        }
      }
    });
  }

  function applyStyle(title) {
    if (!title) return false;
    const wanted = String(title).trim().toLowerCase();
    let matched = false;

    // Recoger todas las hojas de estilo relevantes (no media=print)
    const allLinks = Array.from(document.querySelectorAll('link[rel*="stylesheet"]')).filter(l => (l.getAttribute('media') || 'screen') !== 'print');

    // Desactivar sólo las hojas que tienen 'title' (alternativas); las que no tienen title son 'predeterminadas' y se mantienen activas
    allLinks.forEach(l => {
      try {
        if (l.title && l.title.length > 0) {
          l.disabled = true;
          l.setAttribute('rel', 'alternate stylesheet');
        }
      } catch (e) {}
    });

    // Intentar activar por title primero (entre las alternativas y las predeterminadas con title)
    for (const link of allLinks) {
      try {
        if (link.title && String(link.title).trim().toLowerCase() === wanted) {
          link.disabled = false;
          link.setAttribute('rel', 'stylesheet');
          matched = true;
          break;
        }
      } catch (e) {}
    }
    if (!matched) {
      // intentar emparejamiento por inclusión (tolerante)
        for (const link of allLinks) {
          try {
            const t = String(link.title || '').toLowerCase();
            if (t.indexOf(wanted) !== -1 || wanted.indexOf(t) !== -1) {
              // si la coincidencia es con una hoja alternativa, activarla
              if (link.title && link.title.length > 0) {
                link.disabled = false;
                link.setAttribute('rel', 'stylesheet');
                matched = true;
                console.debug('[estilos_cookies] applyStyle: matched by inclusion:', link.title);
                break;
              }
            }
          } catch (e) {}
        }
    }
    if (!matched) {
      // si no hay coincidencia, activar el estilo por defecto si existe
      const defaultTitle = (function () {
        for (const l of links) {
          try {
            if (l.title && l.title.toLowerCase().includes('modo claro')) return l.title;
          } catch (e) {}
        }
        return links[0] ? links[0].title : null;
      })();
      if (defaultTitle) {
        for (const link of allLinks) {
          try {
            if (String(link.title).trim().toLowerCase() === String(defaultTitle).trim().toLowerCase()) {
              link.disabled = false;
              link.setAttribute('rel', 'stylesheet');
              matched = true;
              console.debug('[estilos_cookies] applyStyle: fallback to default:', defaultTitle);
              break;
            }
          } catch (e) {}
        }
      }
    }
    // Si no hay coincidencia aún, se intentará inyectar por href (si existe cookie)
    console.debug('[estilos_cookies] applyStyle(', title, ') matched=', matched);
    return matched;
  }

  function injectStyleLink(title, href) {
    try {
      const head = document.getElementsByTagName('head')[0] || document.documentElement;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.title = title;
      head.appendChild(link);
      console.debug('[estilos_cookies] injectStyleLink:', title, href);
      return link;
    } catch (e) {
      console.error('[estilos_cookies] injectStyleLink error', e);
      return null;
    }
  }

  function getActiveStyleTitle() {
    for (const l of links) {
      if (!l.disabled) return l.title;
    }
    return links[0] ? links[0].title : null;
  }

  function getActiveStyleHref() {
    // find an enabled stylesheet and return its href
    const allLinks = Array.from(document.querySelectorAll('link[rel*="stylesheet"]')).filter(l => (l.getAttribute('media') || 'screen') !== 'print');
    for (const l of allLinks) {
      try {
        if (!l.disabled && l.href) return l.href;
      } catch (e) {}
    }
    return null;
  }

  // --- Banner de consentimiento de cookies ---
  const consentCookie = getCookie('consent');
  if (!consentCookie) {
    showCookieBanner();
  }

  function showCookieBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.style.position = 'fixed';
    banner.style.left = '0';
    banner.style.right = '0';
    banner.style.bottom = '0';
    banner.style.background = '#222';
    banner.style.color = '#fff';
    banner.style.padding = '12px';
    banner.style.zIndex = '9999';
    banner.style.display = 'flex';
    banner.style.justifyContent = 'space-between';
    banner.style.alignItems = 'center';

    const text = document.createElement('div');
    text.innerHTML = 'Este sitio utiliza cookies propias para mejorar la experiencia. ¿Acepta el uso de cookies?';

    const actions = document.createElement('div');
    const btnAccept = document.createElement('button');
    btnAccept.textContent = 'Aceptar';
    btnAccept.style.marginRight = '8px';
    const btnReject = document.createElement('button');
    btnReject.textContent = 'Rechazar';

    actions.appendChild(btnAccept);
    actions.appendChild(btnReject);

    banner.appendChild(text);
    banner.appendChild(actions);
    document.body.appendChild(banner);

    btnAccept.addEventListener('click', function () {
      setCookie('consent', 'accepted', 90);
      // si hay un estilo seleccionado actualmente, guardar persistente 45 días
      const sel = document.getElementById('selector-estilos');
      if (sel && sel.value) {
        const chosen = String(sel.value).trim();
        setCookie('estilo', chosen, 45);
        // intentar guardar href si existe
        const match = links.find(l => String(l.title).trim().toLowerCase() === chosen.toLowerCase());
        if (match && match.href) {
          setCookie('estilo_href', match.href, 45);
        }
      }
      showTransientMessage('Cookies aceptadas.');
      banner.remove();
    });

    btnReject.addEventListener('click', function () {
      setCookie('consent', 'rejected', 90);
      // eliminar cookie de estilo para no persistir
      deleteCookie('estilo');
      deleteCookie('estilo_href');
      showTransientMessage('Cookies rechazadas.');
      banner.remove();
    });
  }

  function showTransientMessage(msg) {
    const m = document.createElement('div');
    m.textContent = msg;
    m.style.position = 'fixed';
    m.style.bottom = '20px';
    m.style.left = '50%';
    m.style.transform = 'translateX(-50%)';
    m.style.background = '#4caf50';
    m.style.color = '#fff';
    m.style.padding = '8px 12px';
    m.style.borderRadius = '4px';
    m.style.zIndex = '10000';
    document.body.appendChild(m);
    setTimeout(function () { m.remove(); }, 5000);
  }

  // Exponer funciones globalmente para otras páginas (página de política)
  window._ec = {
    setCookie: setCookie,
    getCookie: getCookie,
    deleteCookie: deleteCookie,
    applyStyle: applyStyle,
    getActiveStyleTitle: getActiveStyleTitle,
    getActiveStyleHref: getActiveStyleHref
  };
});
