async function listarServicios() {
    const mensajeHTML = document.getElementById('servicios-mensaje');
    const listarHTML = document.getElementById('lista-servicios');
    try {
        const response = await fetch('api/servicios');
        const servicios = await response.json();
        let servicio = "";
        // console.log(servicios);
        if(!response.ok){
            mensajeHTML.innerHTML = `<a class='mensaje--error'>${servicios.mensaje}</a>`;
            return;
        }
        if(servicios.length === 0){
            mensajeHTML.innerHTML = `Todavía no hay servicios disponibles.`;
            return;
        }
        mensajeHTML.classList.add('oculto');
        for(servicio of servicios){
            listarHTML.innerHTML += `
                <article class='servicio' id='${servicio._id}'>
                    <h3 class='servicio__nombre'>${servicio.nombre}</h3>
                    <p class='servicio__descripcion'>${servicio.descripcion || 'Sin descripción'}</p>
                    <div class='servicio__datos'>
                        <span class='servicio__precio'>${servicio.precio} €</span>
                        <span class='servicio__duracion'>${servicio.duracion} min</span>
                    </div>
                    <div class='servicio__acciones'>
                        <a class='boton boton--secundario' href='servicios/${servicio._id}'>Ver detalles</a>
                        <a class='boton boton--principal' href='reservas?servicio=${servicio._id}'>Reservar</a>
                    </div>
                </article>
            `
        }
    } catch (error) {
        mensajeHTML.innerHTML = `<a class='mensaje--error'>No se han podido cargar los servicios. Inténtalo más tarde.</a>`;
    }
}

listarServicios();