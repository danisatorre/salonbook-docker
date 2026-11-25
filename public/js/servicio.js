async function mostrarServicio(){
    const mensajeHTML = document.getElementById('servicio-mensaje');
    const detalleHTML = document.getElementById('detalle-servicio');
    const servicioId = window.location.pathname.split('/').pop();
    // console.log(servicioId);
    try {
        const response = await fetch(`api/servicios/${servicioId}`);
        const servicio = await response.json();
        // console.log(servicio);
        if(!response.ok){
            mostrarMensaje(mensajeHTML, servicio.mensaje, 'error');
            return;
        }
        // Un servicio desactivado no se puede reservar
        if(!servicio.activo){
            mostrarMensaje(mensajeHTML, 'Este servicio ya no está disponible.', 'error');
            return;
        }
        document.title = `${servicio.nombre} | SalonBook`;
        detalleHTML.innerHTML = `
            <img class='detalle__imagen' src='images/servicios/${servicio.imgServicio}' alt='${servicio.nombre}'>
            <div class='detalle__contenido' id='${servicio._id}'>
                <h1 class='detalle__titulo'>${servicio.nombre}</h1>
                <p class='detalle__descripcion'>${servicio.descripcion || 'Sin descripción'}</p>
                <div class='detalle__datos'>
                    <div class='dato'>
                        <span class='dato__etiqueta'>Precio</span>
                        <span class='dato__valor'>${servicio.precio} €</span>
                    </div>
                    <div class='dato'>
                        <span class='dato__etiqueta'>Duración</span>
                        <span class='dato__valor'>${servicio.duracion} min</span>
                    </div>
                </div>
                <div class='detalle__acciones'>
                    <a class='boton boton--principal' href='reservas?servicio=${servicio._id}'>Reservar este servicio</a>
                    <a class='boton boton--secundario' href='./#servicios'>Ver otros servicios</a>
                </div>
            </div>
        `
        mensajeHTML.classList.add('oculto');
        detalleHTML.classList.remove('oculto');
    } catch (error) {
        // mostrarMensaje(mensajeHTML, 'No se ha podido cargar el servicio. Inténtalo más tarde.', 'error');
        window.location.href = 'error';
    }
}

function usuarioLogueado(){
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const loginHTML = document.getElementById('login');
    const registerHTML = document.getElementById('register');
    const reservarCitaHTML = document.getElementById('reservar-cita');
    const misReservasHTML = document.getElementById('mis-reservas');
    const logoutHTML = document.getElementById('logout');
    if(token && usuario){
        loginHTML.classList.add('oculto');
        registerHTML.classList.add('oculto');
        reservarCitaHTML.classList.remove('oculto');
        misReservasHTML.classList.remove('oculto');
        logoutHTML.classList.remove('oculto');
    }else{
        loginHTML.classList.remove('oculto');
        registerHTML.classList.remove('oculto');
        reservarCitaHTML.classList.add('oculto');
        misReservasHTML.classList.add('oculto');
        logoutHTML.classList.add('oculto');
    }
    document.getElementById('logout').addEventListener('click', () => {
        // alert('Cerrando sesión');
        logoutHTML.textContent = 'Cerrando sesión...';
        logoutHTML.disabled = true;
        setTimeout(() => {
            cerrarSesion();
        }, 2000);
    });
}

function cerrarSesion(){
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = './';
}

function mostrarMensaje(mensajeHTML, texto, tipo) {
    mensajeHTML.textContent = texto;
    mensajeHTML.className = `mensaje mensaje--${tipo}`;
}

usuarioLogueado();
mostrarServicio();
