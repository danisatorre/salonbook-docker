async function iniciarSesion(event) {
    event.preventDefault();
    const mensajeHTML = document.getElementById('login-mensaje');
    const botonHTML = document.getElementById('blogin');
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if(validate_login() === 0){
        return;
    }
    // alert("Datos de login válidos");
    // return;
    botonHTML.disabled = true;
    botonHTML.innerHTML = `Accediendo...`;
    try {
        const response = await fetch('api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: email,
                password: password
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            }
        });
        const datos = await response.json();
        // console.log(datos);
        // return;
        if(!response.ok){
            mostrarMensaje(mensajeHTML, datos.mensaje, 'error');
            botonHTML.disabled = false;
            botonHTML.innerHTML = `Acceder`;
            return;
        }
        if(response.mensaje === 'Usuario o contraseña incorrectos'){
            mostrarMensaje(mensajeHTML, datos.mensaje, 'error');
            botonHTML.disabled = false;
            botonHTML.innerHTML = `Acceder`;
            return;
        }
        localStorage.setItem('token', datos.token);
        localStorage.setItem('usuario', JSON.stringify(datos.usuario));
        
        botonHTML.textContent = 'Accediendo...';
        botonHTML.disabled = true;
        setTimeout(() => {
            // alert("Acceso correcto");
            // return;
            if(datos.usuario.rol === 'admin'){
                window.location.href = 'admin';
            }else{
                window.location.href = './';
            }
        }, 2000);
    } catch (error) {
        // mostrarMensaje(mensajeHTML, 'No se ha podido conectar con el servidor. Inténtalo más tarde.', 'error');
        // botonHTML.disabled = false;
        // botonHTML.innerHTML = `Acceder`;
        window.location.href = 'error';
    }
}

function validate_login() {
    var mail_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    var error = false;

    if (document.getElementById('email').value.length === 0) {
        document.getElementById('error_email_log').innerHTML = "* Escribe tu correo electrónico";
        error = true;
    } else {
        if (!mail_regex.test(document.getElementById('email').value)) {
            document.getElementById('error_email_log').innerHTML = "* El formato del correo no es válido";
            error = true;
        } else {
            document.getElementById('error_email_log').innerHTML = "";
        }
    }

    if (document.getElementById('password').value.length === 0) {
        document.getElementById('error_pwd_log').innerHTML = "* Escribe una contraseña para iniciar sesión";
        error = true;
    } else {
        document.getElementById('error_pwd_log').innerHTML = "";
    }

    if (error == true) {
        return 0;
    }
}

// Muestrar un mensaje en el HTML
function mostrarMensaje(mensajeHTML, texto, tipo) {
    mensajeHTML.textContent = texto;
    mensajeHTML.className = `mensaje mensaje--${tipo}`;
}

document.getElementById('form-login').addEventListener('submit', iniciarSesion);

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
    logoutHTML.addEventListener('click', () => {
        logoutHTML.textContent = 'Cerrando sesión...';
        logoutHTML.disabled = true;
        setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = './';
        }, 2000);
    });
}

usuarioLogueado();