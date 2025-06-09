// Configuración de la API
const API_URL = 'https://inges0985.infy.uk/Proyecto/api/';
// Configuración de la API (ajusta si usas local)
const API_URL = 'http://192.168.1.73/Proyecto/api/';

// Variables globales para almacenar todos los datos cargados
let allUsers = [];
let allCertificates = [];

// Función para mostrar/filtrar usuarios en la tabla
function displayUsers(usersToDisplay, searchTerm = '') {
    const tbody = document.getElementById('usuariosBody');
    tbody.innerHTML = ''; // Limpiar la tabla antes de renderizar

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const filteredUsers = usersToDisplay.filter(user => {
        const userName = user.nombre ? user.nombre.toLowerCase() : '';
        const userEmail = user.email ? user.email.toLowerCase() : '';
        return userName.includes(lowerCaseSearchTerm) || userEmail.includes(lowerCaseSearchTerm);
    });

    if (filteredUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No se encontraron usuarios.</td></tr>';
        return;
    }

    filteredUsers.forEach(usuario => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${usuario.id}</td>
            <td>${usuario.nombre || ''}</td>
            <td>${usuario.email || ''}</td>
            <td>
                <button class="btn btn-action btn-view" onclick="verUsuario('${usuario.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-action btn-edit" onclick="editarUsuario('${usuario.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-action btn-delete" onclick="eliminarUsuario('${usuario.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Cargar usuarios desde Firebase
function cargarUsuarios() {
    const usersRef = database.ref('usuarios');
    usersRef.on('value', (snapshot) => {
        allUsers = []; // Limpiar el array global antes de llenarlo
        if (!snapshot.exists()) {
            displayUsers([]); // Mostrar que no hay usuarios
            return;
        }
        snapshot.forEach(childSnapshot => {
            const userId = childSnapshot.key;
            const userData = childSnapshot.val();
            allUsers.push({ id: userId, ...userData }); // Almacenar también el ID de Firebase
        });
        // Mostrar todos los usuarios inicialmente o aplicar el filtro si ya hay uno
        const currentSearchTerm = document.getElementById('userSearchInput') ? document.getElementById('userSearchInput').value : '';
        displayUsers(allUsers, currentSearchTerm);
    }, (error) => {
        mostrarAlerta('Error al cargar los usuarios: ' + error.message, 'danger');
    });
}

// Función para mostrar/filtrar certificados en la tabla
function displayCertificates(certsToDisplay, searchTerm = '') {
    const tbody = document.getElementById('certificadosBody');
    tbody.innerHTML = ''; // Limpiar la tabla antes de renderizar

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const filteredCerts = certsToDisplay.filter(cert => {
        const userName = cert.usuario_nombre ? cert.usuario_nombre.toLowerCase() : '';
        const certId = cert.id ? cert.id.toLowerCase() : ''; // Buscar también por ID de certificado
        return userName.includes(lowerCaseSearchTerm) || certId.includes(lowerCaseSearchTerm);
    });

    if (filteredCerts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No se encontraron certificados.</td></tr>';
        return;
    }

    filteredCerts.forEach(certificado => {
        const estado = certificado.estado ? certificado.estado.toLowerCase() : 'desconocido';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${certificado.id}</td>
            <td>${certificado.usuario_nombre || ''}</td>
            <td>${formatearFecha(new Date(certificado.fecha_emision))}</td>
            <td><span class="status-${estado}">${certificado.estado || 'Desconocido'}</span></td>
            <td>
                <button class="btn btn-action btn-view" onclick="verCertificado('${certificado.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-action btn-edit" onclick="editarCertificado('${certificado.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-action btn-delete" onclick="eliminarCertificado('${certificado.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Cargar certificados desde Firebase
function cargarCertificados() {
    const certsRef = database.ref('certificados');
    certsRef.on('value', (snapshot) => {
        allCertificates = []; // Limpiar el array global
        if (!snapshot.exists()) {
            displayCertificates([]); // Mostrar que no hay certificados
            return;
        }
        snapshot.forEach(childSnapshot => {
            const certId = childSnapshot.key;
            const certData = childSnapshot.val();
            allCertificates.push({ id: certId, ...certData }); // Almacenar también el ID de Firebase
        });
        // Mostrar todos los certificados inicialmente o aplicar el filtro
        const currentSearchTerm = document.getElementById('certSearchInput') ? document.getElementById('certSearchInput').value : '';
        displayCertificates(allCertificates, currentSearchTerm);
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
            alert(`Nombre: ${usuario.nombre}\nEmail: ${usuario.email}`);
        } else {
            mostrarAlerta('Usuario no encontrado', 'warning');
        }
    });
}

function editarUsuario(id) {
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
        loadingModalInstance = mostrarCargando(); // Mostrar carga
        
        const certRef = database.ref('certificados/' + id);
        const snapshot = await certRef.once('value');

        if (snapshot.exists()) {
            const cert = snapshot.val();
            
            if (cert.pdf_base64) {
                const pdfBase64 = cert.pdf_base64;
                const size = checkPdfSize(pdfBase64);
                
                // Ocultar la modal de carga inmediatamente.
                // La remoción del DOM se maneja dentro de ocultarCargando.
                ocultarCargando(loadingModalInstance); 

                // Crear el modal para mostrar el PDF (esto se hará casi inmediatamente después de ocultar la carga)
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

                // Asegurarse de que el modal de visualización no se agregue múltiples veces
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
                if (size > 2) { 
                    pdfSizeWarning.textContent = `Advertencia: El tamaño de este certificado es de ${size.toFixed(2)} MB. Podría tardar en cargar o causar problemas de memoria en el navegador.`;
                } else {
                    pdfSizeWarning.textContent = '';
                }
                
                // Mostrar el modal del PDF
                const pdfViewerModal = new bootstrap.Modal(document.getElementById('pdfViewerModal'));
                pdfViewerModal.show();

                // Limpiar la URL del blob cuando se cierre el modal
                document.getElementById('pdfViewerModal').addEventListener('hidden.bs.modal', function () {
                    URL.revokeObjectURL(pdfUrl);
                    const modalElement = document.getElementById('pdfViewerModal');
                    if (modalElement) {
                        modalElement.remove();
                    }
                });

            } else {
                ocultarCargando(loadingModalInstance); // Ocultar carga si no hay PDF
                mostrarAlerta('No se encontró el PDF en Base64 para este certificado.', 'warning');
            }
        } else {
            ocultarCargando(loadingModalInstance); // Ocultar carga si no se encuentra el certificado
            mostrarAlerta('Certificado no encontrado.', 'warning');
        }
    } catch (error) {
        ocultarCargando(loadingModalInstance); // Asegurarse de ocultar la carga en caso de error
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

function checkPdfSize(base64String) {
    const sizeInBytes = Math.ceil((base64String.length * 3) / 4);
    const sizeInMB = sizeInBytes / (1024 * 1024);
    return sizeInMB;
}

function descargarPDF(base64String, nombreArchivo) {
    if (base64String.startsWith('http')) {
        const link = document.createElement('a');
        link.href = base64String;
        link.download = nombreArchivo || 'certificado.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
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
        URL.revokeObjectURL(url);
    }
}

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
    if (!document.getElementById('loadingModal')) {
        document.body.insertAdjacentHTML('beforeend', loadingHtml);
    }
    const loadingModalInstance = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModalInstance.show();
    return loadingModalInstance;
}

// Oculta el modal de carga e inmediatamente lo remueve del DOM.
// No espera por la animación de Bootstrap para la remoción.
function ocultarCargando(modalInstance) {
    if (modalInstance) {
        const modalElement = document.getElementById('loadingModal');
        if (modalElement) {
            modalInstance.hide(); // Inicia la animación de ocultar de Bootstrap
            // Un pequeño retardo antes de remover para permitir que la animación comience,
            // pero sin esperar a que termine completamente.
            setTimeout(() => {
                if (modalElement && modalElement.parentNode) {
                    modalElement.parentNode.removeChild(modalElement);
                }
            }, 100); // 100ms es un buen balance para que se vea que "se va"
        }
    }
}

// Inicializa la carga de datos y los listeners de búsqueda al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();
    cargarCertificados();

    // Añadir listeners para los campos de búsqueda
    const userSearchInput = document.getElementById('userSearchInput');
    if (userSearchInput) {
        userSearchInput.addEventListener('input', (e) => displayUsers(allUsers, e.target.value));
    }

    const certSearchInput = document.getElementById('certSearchInput');
    if (certSearchInput) {
        certSearchInput.addEventListener('input', (e) => displayCertificates(allCertificates, e.target.value));
    }
});
