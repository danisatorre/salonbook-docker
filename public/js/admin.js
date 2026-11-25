function comprobarSesion(){
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if(!token || !usuario){
        window.location.href = 'login';
        return false;
    }
    if(usuario.rol !== 'admin'){
        window.location.href = './';
        return false;
    }
    document.getElementById('saludo-usuario').innerHTML = `Hola ${usuario.nombre}, gestiona aquí las reservas y los servicios.`;
    return true;
}

function fechaHoy(){
    const hoy = new Date();
    let mes = hoy.getMonth() + 1;
    let dia = hoy.getDate();
    if(mes < 10){
        mes = '0' + mes;
    }
    if(dia < 10){
        dia = '0' + dia;
    }
    return hoy.getFullYear() + '-' + mes + '-' + dia;
}

function sesionCaducada(response, mensajeHTML){
    if(response.status === 401 || response.status === 403){
        mostrarMensaje(mensajeHTML, 'Tu sesión ha caducado o no tienes permisos. Vuelve a iniciar sesión.', 'error');
        setTimeout(() => {
            cerrarSesion();
        }, 2000);
        return true;
    }
    return false;
}

// Reservas

function pintarReserva(reserva){
    let nombreServicio = 'Servicio eliminado';
    let precio = '';
    if(reserva.servicio){
        nombreServicio = reserva.servicio.nombre;
        precio = `<span class='reserva-tarjeta__precio'>${reserva.servicio.precio} €</span>`;
    }

    let cliente = 'Usuario eliminado';
    if(reserva.usuario){
        cliente = `${reserva.usuario.nombre} · <a class='enlace' href='mailto:${reserva.usuario.email}'>${reserva.usuario.email}</a>`;
    }

    let estado = `<span class='estado estado--confirmada'>Confirmada</span>`;
    let boton = `<button type='button' class='boton boton--secundario boton--pequeno cancelar' data-id='${reserva._id}'>Cancelar cita</button>`;
    if(reserva.estado === 'cancelada'){
        estado = `<span class='estado estado--cancelada'>Cancelada</span>`;
        boton = '';
    }

    return `
        <article class='reserva-tarjeta ${reserva.estado === 'cancelada' ? 'reserva-tarjeta--cancelada' : ''}' id='reserva-${reserva._id}'>
            <div class='reserva-tarjeta__cabecera'>
                <h3 class='reserva-tarjeta__servicio'><b>${reserva.horaInicio}</b> a <b>${reserva.horaFin}</b> · ${nombreServicio}</h3>
                ${estado}
            </div>
            <p class='reserva-tarjeta__cliente'><b>Cliente:</b> ${cliente}</p>
            <p class='reserva-tarjeta__hora'>${precio}</p>
            ${boton}
        </article>
    `;
}

async function listarReservas(){
    const mensajeHTML = document.getElementById('admin-mensaje');
    const reservasHTML = document.getElementById('reservas');
    const reservasMensajeHTML = document.getElementById('reservas-mensaje');
    const fecha = document.getElementById('fecha').value;

    reservasHTML.innerHTML = '';
    if(fecha === ''){
        reservasMensajeHTML.innerHTML = `Elige un día para ver sus reservas.`;
        return;
    }
    reservasMensajeHTML.innerHTML = `Cargando reservas…`;
    try {
        const response = await fetch(`api/reservas?fecha=${fecha}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
        const reservas = await response.json();
        let reserva = "";
        // console.log(reservas);
        if(sesionCaducada(response, mensajeHTML)){
            return;
        }
        if(!response.ok){
            reservasMensajeHTML.innerHTML = `<a class='mensaje--error'>${reservas.mensaje}</a>`;
            return;
        }
        if(reservas.length === 0){
            reservasMensajeHTML.innerHTML = `No hay reservas para este día.`;
            return;
        }
        const confirmadas = reservas.filter(r => r.estado === 'confirmada').length;
        reservasMensajeHTML.innerHTML = `${reservas.length} reserva(s) · ${confirmadas} confirmada(s)`;
        for(reserva of reservas){
            reservasHTML.innerHTML += pintarReserva(reserva);
        }
    } catch (error) {
        // reservasMensajeHTML.innerHTML = `<a class='mensaje--error'>No se han podido cargar las reservas. Inténtalo más tarde.</a>`;
        window.location.href = 'error';
    }
}

async function cancelarReserva(e){
    // console.log(e, e.target);
    // return;
    if(!e.target.classList.contains('cancelar')){
        return;
    }
    const respuesta = confirm('¿Seguro que quieres cancelar esta cita?');
    if(respuesta === false){
        return;
    }
    const mensajeHTML = document.getElementById('admin-mensaje');
    e.target.disabled = true;
    e.target.innerHTML = `Cancelando...`;
    try {
        const response = await fetch(`api/reservas/${e.target.dataset.id}/cancelar`, {
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
        const datos = await response.json();
        // console.log(datos);
        if(sesionCaducada(response, mensajeHTML)){
            return;
        }
        if(!response.ok){
            mostrarMensaje(mensajeHTML, datos.mensaje, 'error');
            e.target.disabled = false;
            e.target.innerHTML = `Cancelar cita`;
            return;
        }
        mostrarMensaje(mensajeHTML, datos.mensaje, 'exito');
        listarReservas();
    } catch (error) {
        // mostrarMensaje(mensajeHTML, 'No se ha podido conectar con el servidor. Inténtalo más tarde.', 'error');
        // e.target.disabled = false;
        // e.target.innerHTML = `Cancelar cita`;
        window.location.href = 'error';
    }
}

// Servicios

async function listarServicios(){
    const serviciosHTML = document.getElementById('servicios');
    const serviciosMensajeHTML = document.getElementById('servicios-mensaje');
    serviciosHTML.innerHTML = '';
    try {
        const response = await fetch('api/servicios');
        const servicios = await response.json();
        let servicio = "";
        // console.log(servicios);
        if(!response.ok){
            serviciosMensajeHTML.innerHTML = `<a class='mensaje--error'>${servicios.mensaje}</a>`;
            return;
        }
        if(servicios.length === 0){
            serviciosMensajeHTML.innerHTML = `Todavía no hay servicios. Crea el primero con el formulario de arriba.`;
            return;
        }
        serviciosMensajeHTML.innerHTML = '';
        for(servicio of servicios){
            serviciosHTML.innerHTML += `
                <article class='servicio-tarjeta' id='servicio-${servicio._id}'>
                    <div class='servicio-tarjeta__cabecera'>
                        <h3 class='servicio-tarjeta__nombre'>${servicio.nombre}</h3>
                        <span class='servicio-tarjeta__precio'>${servicio.precio} €</span>
                    </div>
                    <p class='servicio-tarjeta__descripcion'>${servicio.descripcion || 'Sin descripción'}</p>
                    <p class='servicio-tarjeta__duracion'><b>Duración:</b> ${servicio.duracion} min</p>
                    <div class='servicio-tarjeta__botones'>
                        <button type='button' class='boton boton--principal boton--pequeno editar' data-id='${servicio._id}'>Editar</button>
                        <button type='button' class='boton boton--secundario boton--pequeno eliminar' data-id='${servicio._id}'>Eliminar</button>
                    </div>
                </article>
            `
        }
    } catch (error) {
        // serviciosMensajeHTML.innerHTML = `<a class='mensaje--error'>No se han podido cargar los servicios. Inténtalo más tarde.</a>`;
        window.location.href = 'error';
    }
}

async function guardarServicio(event){
    event.preventDefault();
    const mensajeHTML = document.getElementById('servicio-mensaje');
    const botonHTML = document.getElementById('bguardar');
    const id = document.getElementById('servicio-id').value;

    if(validate_servicio() === 0){
        return;
    }
    // alert("Datos del servicio válidos");
    // return;

    let url = 'api/servicios';
    let metodo = 'POST';
    if(id !== ''){
        url = `api/servicios/${id}`;
        metodo = 'PATCH';
    }
    const textoBoton = botonHTML.innerHTML;
    botonHTML.disabled = true;
    botonHTML.innerHTML = `Guardando...`;
    try {
        const response = await fetch(url, {
            method: metodo,
            body: JSON.stringify({
                nombre: document.getElementById('nombre').value,
                descripcion: document.getElementById('descripcion').value,
                precio: Number(document.getElementById('precio').value),
                duracion: Number(document.getElementById('duracion').value),
                imgServicio: document.getElementById('imgServicio').value
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
        const servicio = await response.json();
        // console.log(servicio);
        botonHTML.disabled = false;
        botonHTML.innerHTML = textoBoton;
        if(sesionCaducada(response, mensajeHTML)){
            return;
        }
        if(!response.ok){
            let texto = servicio.mensaje;
            if(servicio.errores){
                texto += ': ' + servicio.errores.join(', ');
            }
            mostrarMensaje(mensajeHTML, texto, 'error');
            return;
        }
        if(metodo === 'POST'){
            mostrarMensaje(mensajeHTML, `Servicio '${servicio.nombre}' creado correctamente`, 'exito');
        }else{
            mostrarMensaje(mensajeHTML, `Servicio '${servicio.nombre}' modificado correctamente`, 'exito');
        }
        limpiarFormulario();
        listarServicios();
    } catch (error) {
        // mostrarMensaje(mensajeHTML, 'No se ha podido conectar con el servidor. Inténtalo más tarde.', 'error');
        // botonHTML.disabled = false;
        // botonHTML.innerHTML = textoBoton;
        window.location.href = 'error';
    }
}

async function editarServicio(id){
    const mensajeHTML = document.getElementById('servicio-mensaje');
    try {
        const response = await fetch(`api/servicios/${id}`);
        const servicio = await response.json();
        // console.log(servicio);
        if(!response.ok){
            mostrarMensaje(mensajeHTML, servicio.mensaje, 'error');
            return;
        }
        document.getElementById('servicio-id').value = servicio._id;
        document.getElementById('nombre').value = servicio.nombre;
        document.getElementById('descripcion').value = servicio.descripcion;
        document.getElementById('precio').value = servicio.precio;
        document.getElementById('duracion').value = servicio.duracion;
        document.getElementById('imgServicio').value = servicio.imgServicio;

        document.getElementById('form-titulo').innerHTML = `Editar servicio`;
        document.getElementById('bguardar').innerHTML = `Guardar cambios`;
        document.getElementById('bcancelar-edicion').classList.remove('oculto');
        mensajeHTML.className = 'mensaje oculto';
        document.getElementById('form-servicio').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        // mostrarMensaje(mensajeHTML, 'No se ha podido cargar el servicio. Inténtalo más tarde.', 'error');
        window.location.href = 'error';
    }
}

async function eliminarServicio(id){
    const respuesta = confirm('¿Seguro que quieres eliminar este servicio?');
    if(respuesta === false){
        return;
    }
    const mensajeHTML = document.getElementById('admin-mensaje');
    try {
        const response = await fetch(`api/servicios/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
        const datos = await response.json();
        // console.log(datos);
        if(sesionCaducada(response, mensajeHTML)){
            return;
        }
        if(!response.ok){
            mostrarMensaje(mensajeHTML, datos.mensaje, 'error');
            return;
        }
        mostrarMensaje(mensajeHTML, datos.mensaje, 'exito');
        // Si estábamos editando ese servicio limpiamos el formulario
        if(document.getElementById('servicio-id').value === id){
            limpiarFormulario();
        }
        listarServicios();
    } catch (error) {
        // mostrarMensaje(mensajeHTML, 'No se ha podido conectar con el servidor. Inténtalo más tarde.', 'error');
        window.location.href = 'error';
    }
}

function accionServicio(e){
    // console.log(e, e.target);
    // return;
    if(e.target.classList.contains('editar')){
        editarServicio(e.target.dataset.id);
    }
    if(e.target.classList.contains('eliminar')){
        eliminarServicio(e.target.dataset.id);
    }
}

function limpiarFormulario(){
    document.getElementById('form-servicio').reset();
    document.getElementById('servicio-id').value = '';
    document.getElementById('form-titulo').innerHTML = `Nuevo servicio`;
    document.getElementById('bguardar').innerHTML = `Crear servicio`;
    document.getElementById('bcancelar-edicion').classList.add('oculto');
    document.getElementById('error_nombre_ser').innerHTML = "";
    document.getElementById('error_descripcion_ser').innerHTML = "";
    document.getElementById('error_precio_ser').innerHTML = "";
    document.getElementById('error_duracion_ser').innerHTML = "";
}

function validate_servicio() {
    var error = false;

    if (document.getElementById('nombre').value.length === 0) {
        document.getElementById('error_nombre_ser').innerHTML = "* Escribe el nombre del servicio";
        error = true;
    } else {
        if (document.getElementById('nombre').value.length > 100) {
            document.getElementById('error_nombre_ser').innerHTML = "* El nombre no puede superar los 100 caracteres";
            error = true;
        } else {
            document.getElementById('error_nombre_ser').innerHTML = "";
        }
    }

    if (document.getElementById('descripcion').value.length > 500) {
        document.getElementById('error_descripcion_ser').innerHTML = "* La descripción no puede superar los 500 caracteres";
        error = true;
    } else {
        document.getElementById('error_descripcion_ser').innerHTML = "";
    }

    if (document.getElementById('precio').value.length === 0) {
        document.getElementById('error_precio_ser').innerHTML = "* Escribe el precio";
        error = true;
    } else if (Number(document.getElementById('precio').value) < 0) {
        document.getElementById('error_precio_ser').innerHTML = "* El precio no puede ser negativo";
        error = true;
    } else {
        document.getElementById('error_precio_ser').innerHTML = "";
    }

    if (document.getElementById('duracion').value.length === 0) {
        document.getElementById('error_duracion_ser').innerHTML = "* Escribe la duración en minutos";
        error = true;
    } else if (Number(document.getElementById('duracion').value) < 30) {
        document.getElementById('error_duracion_ser').innerHTML = "* La duración mínima es de 30 minutos";
        error = true;
    } else if (Number(document.getElementById('duracion').value) > 480) {
        document.getElementById('error_duracion_ser').innerHTML = "* La duración máxima es de 480 minutos";
        error = true;
    } else if (Number(document.getElementById('duracion').value) % 30 !== 0) {
        document.getElementById('error_duracion_ser').innerHTML = "* La duración tiene que ser múltiplo de 30 (franjas de 30 minutos)";
        error = true;
    } else {
        document.getElementById('error_duracion_ser').innerHTML = "";
    }

    if (error == true) {
        return 0;
    }
}

function mostrarMensaje(mensajeHTML, texto, tipo) {
    mensajeHTML.textContent = texto;
    mensajeHTML.className = `mensaje mensaje--${tipo}`;
}

function cerrarSesion(){
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = 'login';
}

if(comprobarSesion()){
    document.getElementById('fecha').value = fechaHoy();
    listarReservas();
    listarServicios();
    document.getElementById('fecha').addEventListener('change', listarReservas);
    document.getElementById('reservas').addEventListener('click', cancelarReserva);
    document.getElementById('servicios').addEventListener('click', accionServicio);
    document.getElementById('form-servicio').addEventListener('submit', guardarServicio);
    document.getElementById('bcancelar-edicion').addEventListener('click', limpiarFormulario);
    document.getElementById('logout').addEventListener('click', () => {
        document.getElementById('logout').textContent = 'Cerrando sesión...';
        document.getElementById('logout').disabled = true;
        setTimeout(() => {
            cerrarSesion();
        }, 2000);
    });
}
