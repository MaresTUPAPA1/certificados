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
async function verCertificado(id) {
    let loadingModalInstance = null; 

    try {
        loadingModalInstance = mostrarCargando();
        
        const certRef = database.ref('certificados/' + id);
        const snapshot = await certRef.once('value');

        if (snapshot.exists()) {
            const cert = snapshot.val();
            
            if (cert.pdf_url) {
                const pdfUrl = cert.pdf_url;
                
                // Creamos el modal de visualización del PDF
                const modalHtml = `
                    <div class="modal fade" id="pdfViewerModal" tabindex="-1" aria-labelledby="pdfViewerModalLabel" aria-hidden="true">
                        <div class="modal-dialog modal-xl modal-dialog-centered">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="pdfViewerModalLabel">Certificado de ${cert.usuario_nombre || 'Usuario'}</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body text-center">
                                    <div class="mb-3">
                                        <a href="${pdfUrl}" class="btn btn-primary" download="certificado_${cert.usuario_nombre || 'generico'}.pdf" target="_blank">
                                            <i class="fas fa-download"></i> Descargar PDF
                                        </a>
                                    </div>
                                    <iframe src="${pdfUrl}" style="width: 100%; height: 75vh; border: none; background-color: #f8f9fa;"></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                if (!document.getElementById('pdfViewerModal')) {
                    document.body.insertAdjacentHTML('beforeend', modalHtml);
                }
                
                ocultarCargando(loadingModalInstance);

                // Mostramos el modal
                const pdfViewerModal = new bootstrap.Modal(document.getElementById('pdfViewerModal'));
                pdfViewerModal.show();

                // Eliminamos el modal del DOM cuando se cierre para limpiar
                document.getElementById('pdfViewerModal').addEventListener('hidden.bs.modal', function () {
                    const modalElement = document.getElementById('pdfViewerModal');
                    if (modalElement) {
                        modalElement.remove();
                    }
                });

            } else {
                ocultarCargando(loadingModalInstance);
                mostrarAlerta('No se encontró la URL del PDF para este certificado.', 'warning');
            }
        } else {
            ocultarCargando(loadingModalInstance);
            mostrarAlerta('Certificado no encontrado.', 'warning');
        }
    } catch (error) {
        ocultarCargando(loadingModalInstance);
        console.error('Error al ver el certificado:', error);
        mostrarAlerta('Error al cargar el certificado: ' + error.message, 'danger');
    }
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

// Función para descargar el PDF
function descargarPDF(urlOrBase64String, nombreArchivo) {
    if (urlOrBase64String.startsWith('http')) {
        const link = document.createElement('a');
        link.href = urlOrBase64String;
        link.download = nombreArchivo || 'certificado.pdf';
        link.target = '_blank'; // Abrir en una nueva pestaña/ventana
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        // Lógica de descarga de Base64 si por alguna razón todavía recibes Base64
        const byteCharacters = atob(urlOrBase64String);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = nombreArchivo || 'certificado.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Muestra un modal de carga
function mostrarCargando() {
    const loadingHtml = `
        <div class="modal fade" id="loadingModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="loadingModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-sm modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-body text-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                        <p class="mt-2">Cargando certificado...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    // Asegurarse de que el modal no se agregue múltiples veces
    if (!document.getElementById('loadingModal')) {
        document.body.insertAdjacentHTML('beforeend', loadingHtml);
    }
    const loadingModalInstance = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModalInstance.show();
    return loadingModalInstance;
}

// Oculta el modal de carga
function ocultarCargando(modalInstance) {
    if (modalInstance) {
        modalInstance.hide();
        // Opcional: Eliminar el elemento del modal del DOM después de ocultarlo para limpiar
        const modalElement = document.getElementById('loadingModal');
        if (modalElement) {
            modalElement.remove();
        }
    }
}

// Inicializa la carga de datos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();
    cargarCertificados();
});
