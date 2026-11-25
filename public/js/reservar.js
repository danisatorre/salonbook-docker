function comprobarSesion(){
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    // Sin sesión no se puede reservar: lo mandamos al login
    if(!token || !usuario){
        window.location.href = 'login';
        return false;
    }
    document.getElementById('saludo-usuario').innerHTML = `Hola ${usuario.nombre}, elige el servicio, el día y la hora que prefieras.`;
    return true;
}

// Devuelve la fecha de hoy en formato YYYY-MM-DD
function fechaHoy(){
    const hoy = new Date();
    // console.log(hoy);
    // return;
    let mes = hoy.getMonth() + 1;
    let dia = hoy.getDate();
    if(mes < 10){
        mes = '0' + mes;
    }
    if(dia < 10){
        dia = '0' + dia;
    }
    // console.log(mes, dia);
    // return;
    // console.log(hoy.getFullYear());
    // console.log(hoy.getFullYear() + '-' + mes + '-' + dia);
    // return;
    return hoy.getFullYear() + '-' + mes + '-' + dia;
}

async function cargarServicios(){
    const selectHTML = document.getElementById('servicio');
    const mensajeHTML = document.getElementById('reserva-mensaje');
    try {
        const response = await fetch('api/servicios');
        const servicios = await response.json();
        let servicio = "";
        // console.log(servicios);
        if(!response.ok){
            mostrarMensaje(mensajeHTML, servicios.mensaje, 'error');
            return;
        }
        if(servicios.length === 0){
            selectHTML.innerHTML = `<option value="">No hay servicios disponibles</option>`;
            return;
        }
        selectHTML.innerHTML = `<option value="">Selecciona un servicio</option>`;
        for(servicio of servicios){
            selectHTML.innerHTML += `
                <option value='${servicio._id}'
                data-precio='${servicio.precio}'
                data-duracion='${servicio.duracion}'>
                ${servicio.nombre}</option>
            `
        }
        // Si venimos de una redireccion (/reservas?servicio=<id>) marcamos ese servicio 
        const servicioUrl = new URLSearchParams(window.location.search).get('servicio');
        if(servicioUrl){
            selectHTML.value = servicioUrl;
            mostrarInfoServicio();
        }
    } catch (error) {
        // mostrarMensaje(mensajeHTML, 'No se han podido cargar los servicios. Inténtalo más tarde.', 'error');
        window.location.href = 'error';
    }
}

function mostrarInfoServicio(){
    const selectHTML = document.getElementById('servicio');
    const infoHTML = document.getElementById('servicio-info');
    const opcion = selectHTML.options[selectHTML.selectedIndex];
    if(selectHTML.value === ''){
        infoHTML.classList.add('oculto');
        return;
    }
    infoHTML.innerHTML = `<b>Precio:</b> ${opcion.dataset.precio} € · <b>Duración:</b> ${opcion.dataset.duracion} min · <a class='enlace' href='servicios/${selectHTML.value}'>Más información</a>`;
    infoHTML.classList.remove('oculto');
}

async function cargarHoras(){
    const servicio = document.getElementById('servicio').value;
    const fecha = document.getElementById('fecha').value;
    const horasHTML = document.getElementById('horas');
    const horasMensajeHTML = document.getElementById('horas-mensaje');

    horasHTML.innerHTML = '';
    document.getElementById('hora').value = '';

    if(servicio === '' || fecha === ''){
        horasMensajeHTML.innerHTML = `Elige un servicio y un día para ver las horas libres.`;
        return;
    }
    if(validate_fecha() === 0){
        horasMensajeHTML.innerHTML = `Elige otro día para ver las horas libres.`;
        return;
    }
    horasMensajeHTML.innerHTML = `Buscando horas libres…`;
    try {
        const response = await fetch(`api/reservas/disponibles?fecha=${fecha}&servicio=${servicio}`);
        let horas = await response.json();
        let hora = "";
        // console.log(horas);
        if(!response.ok){
            horasMensajeHTML.innerHTML = `<a class='mensaje--error'>${horas.mensaje}</a>`;
            return;
        }
        // Si el dia seleccionado es hoy se quitan las horas que ya han pasado
        if(fecha === fechaHoy()){
            const ahora = new Date();
            let horaActual = ahora.getHours();
            let minutoActual = ahora.getMinutes();
            if(horaActual < 10){
                horaActual = '0' + horaActual;
            }
            if(minutoActual < 10){
                minutoActual = '0' + minutoActual;
            }
            // console.log(horaActual, minutoActual);
            horas = horas.filter(h => h > horaActual + ':' + minutoActual);
            // console.log(horas);
            // return;
        }
        if(horas.length === 0){
            horasMensajeHTML.innerHTML = `No quedan horas libres ese día. Prueba con otro.`;
            return;
        }
        horasMensajeHTML.innerHTML = `Pulsa la hora que prefieras:`;
        for(hora of horas){
            horasHTML.innerHTML += `
                <button type='button' class='hora' data-hora='${hora}'>${hora}</button>
            `
        }
    } catch (error) {
        // horasMensajeHTML.innerHTML = `<a class='mensaje--error'>No se han podido cargar las horas. Inténtalo más tarde.</a>`;
        window.location.href = 'error';
    }
}

function seleccionarHora(e){
    // console.log(e, e.target);
    // return;
    if(!e.target.classList.contains('hora')){
        return;
    }
    const botones = document.querySelectorAll('.hora');
    for(const boton of botones){
        boton.classList.remove('hora--seleccionada');
    }
    e.target.classList.add('hora--seleccionada');
    document.getElementById('hora').value = e.target.dataset.hora;
    document.getElementById('error_hora_res').innerHTML = "";
}

async function crearReserva(event){
    event.preventDefault();
    const mensajeHTML = document.getElementById('reserva-mensaje');
    const botonHTML = document.getElementById('breservar');
    const servicio = document.getElementById('servicio').value;
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;

    if(validate_reserva() === 0){
        return;
    }
    // alert("Datos de reserva válidos");
    // return;
    botonHTML.disabled = true;
    botonHTML.innerHTML = `Reservando...`;
    try {
        const response = await fetch('api/reservas', {
            method: 'POST',
            body: JSON.stringify({
                servicio: servicio,
                fecha: fecha,
                horaInicio: hora
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
        const datos = await response.json();
        // console.log(datos);
        // return;
        if(response.status === 401){
            mostrarMensaje(mensajeHTML, 'Tu sesión ha caducado. Vuelve a iniciar sesión.', 'error');
            setTimeout(() => {
                cerrarSesion();
            }, 2000);
            return;
        }
        if(!response.ok){
            mostrarMensaje(mensajeHTML, datos.mensaje, 'error');
            botonHTML.disabled = false;
            botonHTML.innerHTML = `Confirmar reserva`;
            cargarHoras();
            return;
        }

        mostrarMensaje(mensajeHTML, `Reserva confirmada el ${datos.fecha} de ${datos.horaInicio} a ${datos.horaFin}. Redirigiendo a tus reservas...`, 'exito');
        setTimeout(() => {
            // alert("Reserva correcta");
            // return;
            window.location.href = 'mis-reservas';
        }, 2000);
    } catch (error) {
        // mostrarMensaje(mensajeHTML, 'No se ha podido conectar con el servidor. Inténtalo más tarde.', 'error');
        // botonHTML.disabled = false;
        // botonHTML.innerHTML = `Confirmar reserva`;
        window.location.href = 'error';
    }
}

function validate_fecha() {
    var error = false;
    const fecha = document.getElementById('fecha').value;

    if (fecha.length === 0) {
        document.getElementById('error_fecha_res').innerHTML = "* Elige un día";
        error = true;
    } else {
        if (fecha < fechaHoy()) {
            document.getElementById('error_fecha_res').innerHTML = "* No puedes reservar en un día que ya ha pasado";
            error = true;
        } else {
            // si getDay() devuelve 0 es domingo
            if (new Date(fecha + 'T00:00').getDay() === 0) {
                document.getElementById('error_fecha_res').innerHTML = "* Los domingos la peluquería está cerrada";
                error = true;
            } else {
                document.getElementById('error_fecha_res').innerHTML = "";
            }
        }
    }

    if (error == true) {
        return 0;
    }
}

function validate_reserva() {
    var error = false;

    if (document.getElementById('servicio').value.length === 0) {
        document.getElementById('error_servicio_res').innerHTML = "* Selecciona un servicio";
        error = true;
    } else {
        document.getElementById('error_servicio_res').innerHTML = "";
    }

    if (validate_fecha() === 0) {
        error = true;
    }

    if (document.getElementById('hora').value.length === 0) {
        document.getElementById('error_hora_res').innerHTML = "* Selecciona una hora";
        error = true;
    } else {
        document.getElementById('error_hora_res').innerHTML = "";
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
    document.getElementById('fecha').min = fechaHoy();
    cargarServicios();
    document.getElementById('servicio').addEventListener('change', () => {
        document.getElementById('error_servicio_res').innerHTML = "";
        mostrarInfoServicio();
        cargarHoras();
    });
    document.getElementById('fecha').addEventListener('change', cargarHoras);
    document.getElementById('horas').addEventListener('click', seleccionarHora);
    document.getElementById('form-reserva').addEventListener('submit', crearReserva);
    document.getElementById('logout').addEventListener('click', () => {
        document.getElementById('logout').textContent = 'Cerrando sesión...';
        document.getElementById('logout').disabled = true;
        setTimeout(() => {
            cerrarSesion();
        }, 2000);
    });
}
