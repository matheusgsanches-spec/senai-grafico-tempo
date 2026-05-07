// firebaseConfig.js
const firebaseConfig = {
  apiKey: "AIzaSyAHx5d9xW9rV2Ff3ILrd3lMMABcDQyBTls",
  authDomain: "projeto-grafico-tempo.firebaseapp.com",
  databaseURL: "https://projeto-grafico-tempo-default-rtdb.firebaseio.com",
  projectId: "projeto-grafico-tempo",
  storageBucket: "projeto-grafico-tempo.firebasestorage.app",
  messagingSenderId: "552944550934",
  appId: "1:552944550934:web:e3fc5d71450eb3a0ace137"
};


// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Exporta a referência do banco de dados para ser usada globalmente
const database = firebase.database();