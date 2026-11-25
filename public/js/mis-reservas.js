function comprobarSesion(){
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if(!token || !usuario){
        window.location.href = 'login';
        return false;
    }
    document.getElementById('saludo-usuario').innerHTML = `Hola ${usuario.nombre}, aquí puedes ver y cancelar tus citas.`;
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

function horaAhora(){
    const ahora = new Date();
    let hora = ahora.getHours();
    let minuto = ahora.getMinutes();
    if(hora < 10){
        hora = '0' + hora;
    }
    if(minuto < 10){
        minuto = '0' + minuto;
    }
    // console.log(hora + ':' + minuto);
    // return;
    return hora + ':' + minuto;
}

function formatearFecha(fecha){
    const opciones = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    // console.log(opciones);
    // return;
    return new Date(fecha + 'T00:00').toLocaleDateString('es-ES', opciones);
}

function esProxima(reserva){
    if(reserva.estado !== 'confirmada'){
        return false;
    }
    if(reserva.fecha > fechaHoy()){
        return true;
    }
    if(reserva.fecha === fechaHoy() && reserva.horaInicio > horaAhora()){
        return true;
    }
    return false;
}

function pintarReserva(reserva, proxima){
    let nombreServicio = 'Servicio eliminado';
    let precio = '';
    let enlaceServicio = '';
    if(reserva.servicio){
        nombreServicio = reserva.servicio.nombre;
        precio = `<span class='reserva-tarjeta__precio'>${reserva.servicio.precio} €</span>`;
        enlaceServicio = `<a class='enlace reserva-tarjeta__enlace' href='servicios/${reserva.servicio._id}'>Ver información del servicio</a>`;
    }

    let estado = `<span class='estado estado--confirmada'>Confirmada</span>`;
    if(reserva.estado === 'cancelada'){
        estado = `<span class='estado estado--cancelada'>Cancelada</span>`;
    }else if(!proxima){
        estado = `<span class='estado estado--pasada'>Realizada</span>`;
    }

    let boton = '';
    if(proxima){
        boton = `<button type='button' class='boton boton--secundario boton--pequeno cancelar' data-id='${reserva._id}'>Cancelar cita</button>`;
    }

    return `
        <article class='reserva-tarjeta ${reserva.estado === 'cancelada' ? 'reserva-tarjeta--cancelada' : ''}' id='reserva-${reserva._id}'>
            <div class='reserva-tarjeta__cabecera'>
                <h3 class='reserva-tarjeta__servicio'>${nombreServicio}</h3>
                ${estado}
            </div>
            <p class='reserva-tarjeta__fecha'>${formatearFecha(reserva.fecha)}</p>
            ${enlaceServicio}
            <p class='reserva-tarjeta__hora'><b>${reserva.horaInicio}</b> a <b>${reserva.horaFin}</b> ${precio}</p>
            ${boton}
        </article>
    `;
}

async function listarReservas(){
    const mensajeHTML = document.getElementById('reservas-mensaje');
    const proximasHTML = document.getElementById('proximas');
    const historialHTML = document.getElementById('historial');
    const proximasMensajeHTML = document.getElementById('proximas-mensaje');
    const historialMensajeHTML = document.getElementById('historial-mensaje');

    proximasHTML.innerHTML = '';
    historialHTML.innerHTML = '';
    try {
        const response = await fetch('api/reservas/mis-reservas', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
        const reservas = await response.json();
        let reserva = "";
        // console.log(reservas);
        if(response.status === 401){
            mostrarMensaje(mensajeHTML, 'Tu sesión ha caducado. Vuelve a iniciar sesión.', 'error');
            setTimeout(() => {
                cerrarSesion();
            }, 2000);
            return;
        }
        if(!response.ok){
            mostrarMensaje(mensajeHTML, reservas.mensaje, 'error');
            proximasMensajeHTML.innerHTML = '';
            historialMensajeHTML.innerHTML = '';
            return;
        }

        const proximas = reservas.filter(r => esProxima(r));
        const historial = reservas.filter(r => !esProxima(r));

        // console.log(proximas, historial);
        // return;

        proximas.sort((a, b) => (a.fecha + a.horaInicio).localeCompare(b.fecha + b.horaInicio));
        historial.sort((a, b) => (b.fecha + b.horaInicio).localeCompare(a.fecha + a.horaInicio));

        if(proximas.length === 0){
            proximasMensajeHTML.innerHTML = `No tienes ninguna cita pendiente. <a class='enlace' href='reservas'>Reserva una ahora</a>.`;
        }else{
            proximasMensajeHTML.innerHTML = '';
            for(reserva of proximas){
                proximasHTML.innerHTML += pintarReserva(reserva, true);
            }
        }

        if(historial.length === 0){
            historialMensajeHTML.innerHTML = `Todavía no tienes reservas pasadas ni canceladas.`;
        }else{
            historialMensajeHTML.innerHTML = '';
            for(reserva of historial){
                historialHTML.innerHTML += pintarReserva(reserva, false);
            }
        }
    } catch (error) {
        // mostrarMensaje(mensajeHTML, 'No se han podido cargar tus reservas. Inténtalo más tarde.', 'error');
        // proximasMensajeHTML.innerHTML = '';
        // historialMensajeHTML.innerHTML = '';
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
    const mensajeHTML = document.getElementById('reservas-mensaje');
    const response = await fetch(`api/reservas/${e.target.dataset.id}/cancelar`, {
        method: 'PATCH',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    });
    const datos = await response.json();
    // console.log(datos);
    if(!response.ok){
        mostrarMensaje(mensajeHTML, datos.mensaje, 'error');
        return;
    }
    mostrarMensaje(mensajeHTML, datos.mensaje, 'exito');
    listarReservas();
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
    listarReservas();
    document.getElementById('proximas').addEventListener('click', cancelarReserva);
    document.getElementById('logout').addEventListener('click', () => {
        document.getElementById('logout').textContent = 'Cerrando sesión...';
        document.getElementById('logout').disabled = true;
        setTimeout(() => {
            cerrarSesion();
        }, 2000);
    });
}
