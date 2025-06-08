// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyClRV9eYwCeeZQTWmtrVpvgLol1wHDZwL0",
    authDomain: "certificadosingles-ff262.firebaseapp.com",
    databaseURL: "https://certificadosingles-ff262-default-rtdb.firebaseio.com",
    projectId: "certificadosingles-ff262",
    storageBucket: "certificadosingles-ff262.firebasestorage.app",
    messagingSenderId: "154813393861",
    appId: "1:154813393861:web:96423ad179739661ddb9ac",
    measurementId: "G-W5D3HE67CD"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar Realtime Database
const database = firebase.database();

// Inicializar Firestore
const db = firebase.firestore(); 