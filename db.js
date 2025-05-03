const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "147.232.47.244",
  user: "Bodnar",
  password: "613810128",
  database: "Bodnar", 
});

// Pripojenie a test pripojenia
connection.connect((err) => {
  if (err) {
    console.error("Chyba pripojenia: " + err.stack);
    return;
  }
  console.log("Pripojenie úspešné, ID pripojenia: " + connection.threadId);
});

module.exports = connection;
