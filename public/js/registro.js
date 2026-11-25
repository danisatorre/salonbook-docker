async function registrarUsuario(event) {
    event.preventDefault();
    const mensajeHTML = document.getElementById('registro-mensaje');
    const botonHTML = document.getElementById('bregistro');
    const nombre = document.getElementById('nombre_reg').value.trim();
    const email = document.getElementById('email_reg').value.trim();
    const password = document.getElementById('pwd1_reg').value;

    if(validate_register() === 0){
        return;
    }
    // alert("Datos de registro válidos");
    // return;
    botonHTML.disabled = true;
    botonHTML.innerHTML = `Creando cuenta...`;
    try {
        const response = await fetch('api/auth/registro', {
            method: 'POST',
            body: JSON.stringify({
                nombre: nombre,
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
            if(datos.errores){
                mostrarMensaje(mensajeHTML, datos.errores.join('. '), 'error');
            }else{
                mostrarMensaje(mensajeHTML, datos.mensaje, 'error');
            }
            botonHTML.disabled = false;
            botonHTML.innerHTML = `Crear cuenta`;
            return;
        }

        mostrarMensaje(mensajeHTML, 'Datos de registro válidos. Redirigiendo al inicio de sesión...', 'exito');
        botonHTML.textContent = 'Creando cuenta...';
        botonHTML.disabled = true;
        setTimeout(() => {
            // alert("Registro correcto");
            // return;
            window.location.href = 'login';
        }, 2000);
    } catch (error) {
        // mostrarMensaje(mensajeHTML, 'No se ha podido conectar con el servidor. Inténtalo más tarde.', 'error');
        // botonHTML.disabled = false;
        // botonHTML.innerHTML = `Crear cuenta`;
        window.location.href = 'error';
    }
}

function validate_register() {
    var nombre_regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]+$/;
    var mail_regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    var pwd_regex = /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/;
    var error = false;

    if (document.getElementById('nombre_reg').value.length === 0) {
        document.getElementById('error_nombre_reg').innerHTML = "* Escribe tu nombre";
        error = true;
    } else {
        if (document.getElementById('nombre_reg').value.length < 2) {
            document.getElementById('error_nombre_reg').innerHTML = "* El nombre debe tener 2 caracteres como mínimo";
            error = true;
        } else {
            if (document.getElementById('nombre_reg').value.length > 50) {
                document.getElementById('error_nombre_reg').innerHTML = "* El nombre no puede superar los 50 caracteres";
                error = true;
            } else {
                if (!nombre_regex.test(document.getElementById('nombre_reg').value)) {
                    document.getElementById('error_nombre_reg').innerHTML = "* El nombre solo puede contener letras y espacios";
                    error = true;
                } else {
                    document.getElementById('error_nombre_reg').innerHTML = "";
                }
            }
        }
    }

    if (document.getElementById('email_reg').value.length === 0) {
        document.getElementById('error_email_reg').innerHTML = "* Escribe tu correo electrónico";
        error = true;
    } else {
        if (!mail_regex.test(document.getElementById('email_reg').value)) {
            document.getElementById('error_email_reg').innerHTML = "* El formato del correo no es válido";
            error = true;
        } else {
            document.getElementById('error_email_reg').innerHTML = "";
        }
    }

    if (document.getElementById('pwd1_reg').value.length === 0) {
        document.getElementById('error_pwd1_reg').innerHTML = "* Escribe una contraseña";
        error = true;
    } else if (document.getElementById('pwd1_reg').value.length < 8) {
        document.getElementById('error_pwd1_reg').innerHTML = "* La contraseña debe tener 8 caracteres como mínimo";
        error = true;
    } else if (!pwd_regex.test(document.getElementById('pwd1_reg').value)) {
        document.getElementById('error_pwd1_reg').innerHTML = "* La contraseña debe contener mayúsculas, minúsculas, números y algún símbolo especial";
        error = true;
    } else {
        document.getElementById('error_pwd1_reg').innerHTML = "";
    }

    if (document.getElementById('pwd2_reg').value.length === 0) {
        document.getElementById('error_pwd2_reg').innerHTML = "* Vuelve a escribir la contraseña";
        error = true;
    } else if (document.getElementById('pwd2_reg').value !== document.getElementById('pwd1_reg').value) {
        document.getElementById('error_pwd2_reg').innerHTML = "* Las contraseñas no coinciden";
        error = true;
    } else {
        document.getElementById('error_pwd2_reg').innerHTML = "";
    }

    if (error == true) {
        return 0;
    }
}

function mostrarMensaje(mensajeHTML, texto, tipo) {
    mensajeHTML.textContent = texto;
    mensajeHTML.className = `mensaje mensaje--${tipo}`;
}

document.getElementById('form-registro').addEventListener('submit', registrarUsuario);

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