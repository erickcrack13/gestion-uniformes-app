const firebaseConfig = {
  apiKey: "AIzaSyCtozlKF5apDVita-aX779v9yxXs2E9_xo",
  authDomain: "inventario-1040b.firebaseapp.com",
  projectId: "inventario-1040b",
  storageBucket: "inventario-1040b.firebasestorage.app",
  messagingSenderId: "147626783362",
  appId: "1:147626783362:web:12f528dc412397b016ba9b",
  measurementId: "G-XGJN97X8D9"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Obtener una referencia a la base de datos de Firestore
const db = firebase.firestore();
