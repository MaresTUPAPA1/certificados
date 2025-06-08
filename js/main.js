// Configuración de la API
const API_URL = 'https://inges0985.infy.uk/Proyecto/api/';

// Función para cargar los usuarios
async function cargarUsuarios() {
    try {
        const usersRef = database.ref('usuarios');
        usersRef.on('value', (snapshot) => {
            const tbody = document.getElementById('usuariosBody');
            tbody.innerHTML = '';
            
            snapshot.forEach(childSnapshot => {
                const userId = childSnapshot.key;
                const usuario = childSnapshot.val();
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${userId}</td>
                    <td>${usuario.nombre}</td>
                    <td>${usuario.email}</td>
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
        });
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        mostrarAlerta('Error al cargar los usuarios', 'danger');
    }
}

// Función para cargar los certificados
async function cargarCertificados() {
    try {
        const certsRef = database.ref('certificados');
        certsRef.on('value', (snapshot) => {
            const tbody = document.getElementById('certificadosBody');
            tbody.innerHTML = '';
            
            snapshot.forEach(childSnapshot => {
                const certId = childSnapshot.key;
                const certificado = childSnapshot.val();
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${certId}</td>
                    <td>${certificado.usuario_nombre}</td>
                    <td>${formatearFecha(new Date(certificado.fecha_emision))}</td>
                    <td><span class="status-${certificado.estado.toLowerCase()}">${certificado.estado}</span></td>
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
        });
    } catch (error) {
        console.error('Error al cargar certificados:', error);
        mostrarAlerta('Error al cargar los certificados', 'danger');
    }
}

// Funciones auxiliares
function formatearFecha(fecha) {
    return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function mostrarAlerta(mensaje, tipo) {
    const alertaDiv = document.createElement('div');
    alertaDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
    alertaDiv.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.querySelector('.container').insertAdjacentElement('afterbegin', alertaDiv);
    
    setTimeout(() => {
        alertaDiv.remove();
    }, 5000);
}

// Funciones para las acciones de usuarios
async function verUsuario(id) {
    try {
        const userRef = database.ref('usuarios/' + id);
        userRef.once('value', (snapshot) => {
            if (snapshot.exists()) {
                const usuario = snapshot.val();
                // Aquí puedes implementar la lógica para mostrar los detalles
                console.log('Detalles del usuario:', usuario);
            }
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        mostrarAlerta('Error al obtener los detalles del usuario', 'danger');
    }
}

async function editarUsuario(id) {
    try {
        const userRef = database.ref('usuarios/' + id);
        userRef.once('value', (snapshot) => {
            if (snapshot.exists()) {
                const usuario = snapshot.val();
                // Aquí puedes implementar la lógica para editar
                console.log('Editar usuario:', usuario);
            }
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        mostrarAlerta('Error al obtener los detalles del usuario', 'danger');
    }
}

async function eliminarUsuario(id) {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
        try {
            const userRef = database.ref('usuarios/' + id);
            await userRef.remove();
            mostrarAlerta('Usuario eliminado correctamente', 'success');
            // Realtime Database listeners se encargan de actualizar la lista automáticamente
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta('Error al eliminar el usuario', 'danger');
        }
    }
}

// Funciones para las acciones de certificados
async function verCertificado(id) {
    try {
        const certRef = database.ref('certificados/' + id);
        certRef.once('value', (snapshot) => {
            if (snapshot.exists()) {
                const certificado = snapshot.val();
                // Aquí puedes implementar la lógica para mostrar los detalles
                console.log('Detalles del certificado:', certificado);
            }
        });
    } catch (error) {
        console.error('Error al obtener certificado:', error);
        mostrarAlerta('Error al obtener los detalles del certificado', 'danger');
    }
}

async function editarCertificado(id) {
    try {
        const certRef = database.ref('certificados/' + id);
        certRef.once('value', (snapshot) => {
            if (snapshot.exists()) {
                const certificado = snapshot.val();
                // Aquí puedes implementar la lógica para editar
                console.log('Editar certificado:', certificado);
            }
        });
    } catch (error) {
        console.error('Error al obtener certificado:', error);
        mostrarAlerta('Error al obtener los detalles del certificado', 'danger');
    }
}

async function eliminarCertificado(id) {
    if (confirm('¿Está seguro de eliminar este certificado?')) {
        try {
            const certRef = database.ref('certificados/' + id);
            await certRef.remove();
            mostrarAlerta('Certificado eliminado correctamente', 'success');
            // Realtime Database listeners se encargan de actualizar la lista automáticamente
        } catch (error) {
            console.error('Error:', error);
            mostrarAlerta('Error al eliminar el certificado', 'danger');
        }
    }
}

// Cargar datos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();
    cargarCertificados();
});