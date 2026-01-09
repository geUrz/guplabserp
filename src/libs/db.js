import mysql from 'mysql2/promise';

// Configura la conexión a la base de datos
const connection = mysql.createPool({
  host: '192.168.10.2',
  user: 'root',
  password: 'adm1nsql1',
  database: 'guplabserp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default connection  
