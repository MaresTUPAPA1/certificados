// Configuración de la API
const API_URL = 'https://inges0985.infy.uk/Proyecto/api/';
// Configuración de la API (ajusta si usas local)
const API_URL = 'http://192.168.1.73/Proyecto/api/';

// Cargar usuarios desde Firebase
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
    let loadingModalElement = null; // Variable para almacenar la referencia al elemento DOM del modal de carga

    try {
        loadingModalInstance = mostrarCargando();
        loadingModalElement = document.getElementById('loadingModal'); // Obtener la referencia al elemento

        const certRef = database.ref('certificados/' + id);
        const snapshot = await certRef.once('value');

        if (snapshot.exists()) {
            const cert = snapshot.val();
            
            if (cert.pdf_base64) {
                const pdfBase64 = cert.pdf_base64;
                const size = checkPdfSize(pdfBase64);
                
                // Asegurar que el modal de carga esté completamente oculto ANTES de mostrar el PDF modal
                if (loadingModalInstance && loadingModalElement) {
                    await new Promise(resolve => {
                        // Escuchar el evento 'hidden.bs.modal' para saber cuándo la animación terminó
                        loadingModalElement.addEventListener('hidden.bs.modal', function handler() {
                            loadingModalElement.removeEventListener('hidden.bs.modal', handler); // Limpiar el listener
                            loadingModalElement.remove(); // Remover el elemento del DOM aquí
                            resolve(); // Resolver la promesa para continuar
                        });
                        ocultarCargando(loadingModalInstance); // Iniciar la animación de ocultar
                    });
                }
                
                // Crear el modal para mostrar el PDF (solo se ejecuta después de que el modal de carga esté oculto)
                const modalHtml = `
                    <div class="modal fade" id="pdfViewerModal" tabindex="-1" aria-labelledby="pdfViewerModalLabel" aria-hidden="true">
                        <div class="modal-dialog modal-xl modal-dialog-centered">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="pdfViewerModalLabel">Certificado de ${cert.usuario_nombre || 'Usuario'}</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body text-center">
                                    <p class="text-muted" id="pdfSizeWarning"></p>
                                    <div class="mb-3">
                                        <button class="btn btn-primary" onclick="descargarPDF('${pdfBase64}', 'certificado_${cert.usuario_nombre || 'generico'}.pdf')">
                                            <i class="fas fa-download"></i> Descargar PDF
                                        </button>
                                    </div>
                                    <iframe id="pdfDisplayIframe" style="width: 100%; height: 75vh; border: none; background-color: #f8f9fa;"></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                if (!document.getElementById('pdfViewerModal')) {
                    document.body.insertAdjacentHTML('beforeend', modalHtml);
                }

                // Convertir base64 a blob y crear URL
                const byteCharacters = atob(pdfBase64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const pdfUrl = URL.createObjectURL(blob);

                // Mostrar el PDF en el iframe
                const pdfViewerIframe = document.getElementById('pdfDisplayIframe');
                pdfViewerIframe.src = pdfUrl;

                // Mostrar advertencia de tamaño si es grande
                const pdfSizeWarning = document.getElementById('pdfSizeWarning');
                if (size > 2) { // Advertir si es mayor a 2MB (ajusta este umbral si lo deseas)
                    pdfSizeWarning.textContent = `Advertencia: El tamaño de este certificado es de ${size.toFixed(2)} MB. Podría tardar en cargar o causar problemas de memoria en el navegador.`;
                } else {
                    pdfSizeWarning.textContent = ''; // Limpiar advertencia si no es grande
                }
                
                const pdfViewerModal = new bootstrap.Modal(document.getElementById('pdfViewerModal'));
                pdfViewerModal.show();

                document.getElementById('pdfViewerModal').addEventListener('hidden.bs.modal', function () {
                    URL.revokeObjectURL(pdfUrl);
                    const modalElement = document.getElementById('pdfViewerModal');
                    if (modalElement) {
                        modalElement.remove();
                    }
                });

            } else {
                // Si no hay PDF o certificado no encontrado/error, asegurar que la carga se oculta correctamente
                if (loadingModalElement) {
                    loadingModalElement.remove(); // Remover si no se espera la animación
                }
                mostrarAlerta('No se encontró el PDF en Base64 para este certificado.', 'warning');
            }
        } else {
            if (loadingModalElement) {
                loadingModalElement.remove(); // Remover si no se espera la animación
            }
            mostrarAlerta('Certificado no encontrado.', 'warning');
        }
    } catch (error) {
        if (loadingModalElement) {
            loadingModalElement.remove(); // Remover si no se espera la animación
        }
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

// Función para comprobar el tamaño del PDF en MB (para Base64)
function checkPdfSize(base64String) {
    // Estimación aproximada: cada 4 caracteres Base64 representan 3 bytes de datos originales
    const sizeInBytes = Math.ceil((base64String.length * 3) / 4);
    const sizeInMB = sizeInBytes / (1024 * 1024);
    return sizeInMB;
}

// Función para descargar el PDF (ahora prioriza Base64, pero compatible con URL si fuera necesario)
function descargarPDF(base64String, nombreArchivo) {
    // Si la cadena parece una URL, la trata como tal (aunque en este contexto, esperaremos Base64)
    if (base64String.startsWith('http')) {
        const link = document.createElement('a');
        link.href = base64String;
        link.download = nombreArchivo || 'certificado.pdf';
        link.target = '_blank'; // Abrir en una nueva pestaña/ventana
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        // Lógica para Base64
        const byteCharacters = atob(base64String);
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
        URL.revokeObjectURL(url); // Liberar la URL del objeto Blob
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

// Oculta el modal de carga (solo inicia la animación de ocultar)
// El elemento del DOM se removerá cuando su animación haya terminado
function ocultarCargando(modalInstance) {
    if (modalInstance) {
        modalInstance.hide();
        // IMPORTANTE: Se ha quitado la línea 'modalElement.remove();' de aquí.
        // La eliminación del elemento ahora se maneja en 'verCertificado'
        // después de que la animación de ocultamiento haya terminado.
    }
}

// Inicializa la carga de datos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();
    cargarCertificados();
});
