// Configuración de la API
const API_URL = 'https://inges0985.infy.uk/Proyecto/api/';

function cargarUsuarios() {
    const usersRef = database.ref('usuarios');
    usersRef.on('value', (snapshot) => {
        const tbody = document.getElementById('usuariosBody');
        tbody.innerHTML = '';
        if (!snapshot.exists()) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay usuarios registrados.</td></tr>';
            return;
        }
        snapshot.forEach(childSnapshot => {
            const userId = childSnapshot.key;
            const usuario = childSnapshot.val();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${userId}</td>
                <td>${usuario.nombre || ''}</td>
                <td>${usuario.email || ''}</td>
                <td>
                    <button class="btn btn-action btn-view" onclick="verUsuario('${userId}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-action btn-edit" onclick="editarUsuario('${userId}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-action btn-delete" onclick="eliminarUsuario('${userId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }, (error) => {
        mostrarAlerta('Error al cargar los usuarios: ' + error.message, 'danger');
    });
}

// Cargar certificados desde Firebase
function cargarCertificados() {
    const certsRef = database.ref('certificados');
    certsRef.on('value', (snapshot) => {
        const tbody = document.getElementById('certificadosBody');
        tbody.innerHTML = '';
        if (!snapshot.exists()) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay certificados generados.</td></tr>';
            return;
        }
        snapshot.forEach(childSnapshot => {
            const certId = childSnapshot.key;
            const certificado = childSnapshot.val();
            const estado = certificado.estado ? certificado.estado.toLowerCase() : 'desconocido';
            tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${certId}</td>
                <td>${certificado.usuario_nombre || ''}</td>
                <td>${formatearFecha(new Date(certificado.fecha_emision))}</td>
                <td><span class="status-${estado}">${certificado.estado || 'Desconocido'}</span></td>
                <td>
                    <button class="btn btn-action btn-view" onclick="verCertificado('${certId}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-action btn-edit" onclick="editarCertificado('${certId}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-action btn-delete" onclick="eliminarCertificado('${certId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }, (error) => {
        mostrarAlerta('Error al cargar los certificados: ' + error.message, 'danger');
    });
}

// Formatea la fecha a español
function formatearFecha(fecha) {
    if (!(fecha instanceof Date) || isNaN(fecha)) return '';
    return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Muestra una alerta Bootstrap
function mostrarAlerta(mensaje, tipo) {
    const alertaDiv = document.createElement('div');
    alertaDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
    alertaDiv.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container').insertAdjacentElement('afterbegin', alertaDiv);
    setTimeout(() => alertaDiv.remove(), 5000);
}

// Acciones de usuario
function verUsuario(id) {
    const userRef = database.ref('usuarios/' + id);
    userRef.once('value').then(snapshot => {
        if (snapshot.exists()) {
            const usuario = snapshot.val();
            // Aquí puedes mostrar un modal con los detalles
            alert(`Nombre: ${usuario.nombre}\nEmail: ${usuario.email}`);
        } else {
            mostrarAlerta('Usuario no encontrado', 'warning');
        }
    });
}

function editarUsuario(id) {
    // Implementa aquí la lógica para editar usuario (modal, formulario, etc.)
    mostrarAlerta('Función de edición aún no implementada', 'info');
}

function eliminarUsuario(id) {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
        database.ref('usuarios/' + id).remove()
            .then(() => mostrarAlerta('Usuario eliminado correctamente', 'success'))
            .catch(error => mostrarAlerta('Error al eliminar el usuario: ' + error.message, 'danger'));
    }
}

// Acciones de certificado
function verCertificado(id) {
    const certRef = database.ref('certificados/' + id);
    certRef.once('value').then(snapshot => {
        if (snapshot.exists()) {
            const cert = snapshot.val();
            // Puedes mostrar un modal con los detalles, o abrir el PDF si tienes la URL
            if (cert.url_pdf) {
                window.open(cert.url_pdf, '_blank');
            } else {
                alert(JSON.stringify(cert, null, 2));
            }
        } else {
            mostrarAlerta('Certificado no encontrado', 'warning');
        }
    });
}

function editarCertificado(id) {
    mostrarAlerta('Función de edición aún no implementada', 'info');
}

function eliminarCertificado(id) {
    if (confirm('¿Está seguro de eliminar este certificado?')) {
        database.ref('certificados/' + id).remove()
            .then(() => mostrarAlerta('Certificado eliminado correctamente', 'success'))
            .catch(error => mostrarAlerta('Error al eliminar el certificado: ' + error.message, 'danger'));
    }
}

// Inicializa la carga de datos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();
    cargarCertificados();
});

// Cargar datos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();
    cargarCertificados();
});
