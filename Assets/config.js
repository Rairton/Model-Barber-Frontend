// Altere a URL conforme o ambiente
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api'
  : 'https://model-barber-backend.onrender.com/api';

export default API_URL;

