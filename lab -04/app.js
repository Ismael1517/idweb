let tareas = JSON.parse(localStorage.getItem('tareasUNSA')) || [];
let filtroActual = 'todas';

const formTarea = document.getElementById('formTarea');
const divAlertas = document.getElementById('divAlertas');
const listaTareas = document.getElementById('listaTareas');
const estadisticas = document.getElementById('estadisticas');

document.addEventListener('DOMContentLoaded', () => {
    renderizarTareas();
});

function guardarEnLocalStorage() {
    localStorage.setItem('tareasUNSA', JSON.stringify(tareas));
}

formTarea.addEventListener('submit', function(e) {
    e.preventDefault();

    const titulo = document.getElementById('titulo').value.trim();
    const curso = document.getElementById('curso').value.trim();
    const fechaEntrega = document.getElementById('fechaEntrega').value;

    if (titulo === '' || curso === '' || fechaEntrega === '') {
        mostrarAlerta('Completa todos los campos antes de guardar.', 'warning');
        return;
    }

    const fechaSeleccionada = new Date(fechaEntrega + 'T00:00:00');
    const fechaHoy = new Date();
    fechaHoy.setHours(0, 0, 0, 0);

    if (fechaSeleccionada <= fechaHoy) {
        mostrarAlerta('La fecha de entrega debe ser posterior al día de hoy.', 'danger');
        return;
    }

    const nuevaTarea = {
        id: Date.now(),
        titulo: titulo,
        curso: curso,
        fechaEntrega: fechaEntrega,
        completada: false
    };

    tareas.push(nuevaTarea);
    guardarEnLocalStorage();

    formTarea.reset();
    divAlertas.innerHTML = '';
    renderizarTareas();
});

function mostrarAlerta(mensaje, tipo) {
    divAlertas.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show rounded-3 mb-3" role="alert">
            <i class="fa-solid fa-triangle-exclamation me-2"></i>${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}

function renderizarTareas() {
    listaTareas.innerHTML = '';

    const tareasFiltradas = tareas.filter(tarea => {
        if (filtroActual === 'pendientes') return !tarea.completada;
        if (filtroActual === 'completadas') return tarea.completada;
        return true;
    });

    if (tareasFiltradas.length === 0) {
        listaTareas.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fa-regular fa-folder-open fa-3x mb-2"></i>
                <p>No hay tareas registradas en esta sección.</p>
            </div>`;
        actualizarEstadisticas();
        return;
    }

    tareasFiltradas.map(tarea => {
        const col = document.createElement('div');
        col.className = 'col-md-6';

        col.innerHTML = `
            <div class="card card-custom card-tarea p-3 ${tarea.completada ? 'opacity-75' : ''}">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <span class="badge ${tarea.completada ? 'bg-secondary' : 'bg-danger'} text-white">
                        ${tarea.completada ? 'Completada' : 'Pendiente'}
                    </span>
                    <small class="text-muted"><i class="fa-regular fa-calendar me-1"></i>${tarea.fechaEntrega}</small>
                </div>
                <h6 class="fw-bold mb-1 ${tarea.completada ? 'tarea-completada' : ''}">${tarea.titulo}</h6>
                <p class="small text-muted mb-3"><i class="fa-solid fa-book me-1"></i>${tarea.curso}</p>
                
                <div class="d-flex gap-2 pt-2 border-top">
                    <button class="btn btn-sm ${tarea.completada ? 'btn-outline-secondary' : 'btn-outline-danger'} w-100" 
                            onclick="alternarEstado(${tarea.id})">
                        ${tarea.completada ? '<i class="fa-solid fa-rotate-left me-1"></i>Reabrir' : '<i class="fa-solid fa-check me-1"></i>Completar'}
                    </button>
                    <button class="btn btn-sm btn-outline-dark" onclick="eliminarTarea(${tarea.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        listaTareas.appendChild(col);
    });

    actualizarEstadisticas();
}

function alternarEstado(id) {
    const tarea = tareas.find(t => t.id === id);
    if (tarea) {
        tarea.completada = !tarea.completada;
        guardarEnLocalStorage();
        renderizarTareas();
    }
}

function eliminarTarea(id) {
    tareas = tareas.filter(t => t.id !== id);
    guardarEnLocalStorage();
    renderizarTareas();
}

function filtrarTareas(tipo) {
    filtroActual = tipo;
    
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    renderizarTareas();
}

function actualizarEstadisticas() {
    const total = tareas.length;
    const completadas = tareas.reduce((acc, t) => t.completada ? acc + 1 : acc, 0);
    const pendientes = total - completadas;

    estadisticas.innerHTML = `
        <span class="small fw-bold">
            <i class="fa-solid fa-list-check me-1"></i>Total: ${total} | 
            <span class="text-danger">Pendientes: ${pendientes}</span> | 
            <span class="text-success">Completadas: ${completadas}</span>
        </span>`;
}
