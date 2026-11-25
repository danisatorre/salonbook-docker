function bienvenidaUsuario(){
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const bienvenidaHTML = document.getElementById('bienvenida-usuario');
    if(token && usuario){
        bienvenidaHTML.innerHTML = `¡Nos alegramos de verte, ${usuario.nombre}!`;
    }
}

function usuarioLogueado(){
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const loginHTML = document.getElementById('login');
    const registerHTML = document.getElementById('register');
    const logoutHTML = document.getElementById('logout');
    const reservarCitaHTML = document.getElementById('reservar-cita');
    const misReservasHTML = document.getElementById('mis-reservas');
    if(token && usuario){
        loginHTML.classList.add('oculto');
        registerHTML.classList.add('oculto');
        logoutHTML.classList.remove('oculto');
        reservarCitaHTML.classList.remove('oculto');
        misReservasHTML.classList.remove('oculto');
    }else{
        loginHTML.classList.remove('oculto');
        registerHTML.classList.remove('oculto');
        logoutHTML.classList.add('oculto');
        reservarCitaHTML.classList.add('oculto');
        misReservasHTML.classList.add('oculto');
    }
    document.getElementById('logout').addEventListener('click', (e) => {
        // alert('Cerrando sesión');
        logoutHTML.textContent = 'Cerrando sesión...';
        logoutHTML.disabled = true;
        setTimeout(() => {
            // alert("Sesion cerrada");
            // return;
            cerrarSesion(e);
        }, 2000);
    });
}

function cerrarSesion(e){
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = './';
}

bienvenidaUsuario();
usuarioLogueado();