const db = require("../db.js");

// Helper to build ORDER BY clause based on ?sort=asc|desc
function buildSortOrder(req, defaultColumn = "cena") {
  const sortParam = req.query.sort;
  const direction =
    sortParam && sortParam.toLowerCase() === "desc" ? "DESC" : "ASC";
  return `ORDER BY ${defaultColumn} ${direction}`;
}

// 1. Get products by category name
exports.getProductsByCategory = (req, res) => {
  const { categoryName } = req.params;
  const orderClause = buildSortOrder(req);
  const sql = `
    SELECT T.id_tovar, T.nazov, T.cena
    FROM Tovar T
    JOIN Kategorie K ON T.id_kategorie = K.id_kategorie
    WHERE K.nazov = ?
    ${orderClause}
  `;
  db.query(sql, [categoryName], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// 2. Get products by vehicle brand and model
exports.getProductsByVehicle = (req, res) => {
  const { brand, model } = req.params;
  const orderClause = buildSortOrder(req);
  const sql = `
    SELECT T.id_tovar, T.nazov, T.cena
    FROM Tovar T
    JOIN Vozidlo V ON T.id_vozidlo = V.id_vozidlo
    WHERE V.znacka = ? AND V.model = ?
    ${orderClause}
  `;
  db.query(sql, [brand, model], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// 3. Get products by vehicle brand
exports.getProductsByBrand = (req, res) => {
  const { brand } = req.params;
  const orderClause = buildSortOrder(req);
  const sql = `
    SELECT T.id_tovar, T.nazov, T.cena
    FROM Tovar T
    JOIN Vozidlo V ON T.id_vozidlo = V.id_vozidlo
    WHERE V.znacka LIKE CONCAT('%', ?, '%')
    ${orderClause}
  `;
  db.query(sql, [brand], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// 4. Get products by category ID
exports.getProductsByCategoryId = (req, res) => {
  const { categoryId } = req.params;
  const orderClause = buildSortOrder(req);
  const sql = `
    SELECT id_tovar, nazov, cena
    FROM Tovar
    WHERE id_kategorie = ?
    ${orderClause}
  `;
  db.query(sql, [categoryId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// 5. Get products by name search
exports.getProductsByName = (req, res) => {
  const { productName } = req.params;
  const orderClause = buildSortOrder(req);
  const sql = `
    SELECT id_tovar, nazov, cena
    FROM Tovar
    WHERE nazov LIKE CONCAT('%', ?, '%')
    ${orderClause}
  `;
  db.query(sql, [productName], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// 6. Get all products in a store
exports.getProductsInStore = (req, res) => {
  const { storeName } = req.params;
  const orderClause = buildSortOrder(req);
  const sql = `
    SELECT T.nazov, S.stav, S.pocet, T.id_tovar
    FROM Sklad S
    JOIN Predajna PR ON S.id_predajna = PR.id_predajna
    JOIN Tovar T ON S.id_tovar = T.id_tovar
    WHERE PR.nazov = ?
    ${orderClause}
  `;
  db.query(sql, [storeName], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// 7. Get all categories
exports.getCategories = (req, res) => {
  const sql = `SELECT id_kategorie, nazov FROM Kategorie`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// 8. Add item to cart
exports.addToCart = (req, res) => {
  const { userId, productId, quantity } = req.body;
  const sql = `INSERT INTO Kosik (id_pouzivatel, id_tovar, mnozstvo) VALUES (?, ?, ?)`;
  db.query(sql, [userId, productId, quantity], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

// 9. Get cart items for user
exports.getUserCart = (req, res) => {
  const userId = req.params.userId;
  const sql = `
    SELECT T.id_tovar, T.nazov, K.mnozstvo, T.cena,
           (K.mnozstvo * T.cena) AS celkova_cena
    FROM Kosik K
    JOIN Tovar T ON K.id_tovar = T.id_tovar
    WHERE K.id_pouzivatel = ?`;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// 10. Remove item from cart
exports.removeFromCart = (req, res) => {
  const { userId, productId } = req.params;
  const sql = `DELETE FROM Kosik WHERE id_pouzivatel = ? AND id_tovar = ?`;
  db.query(sql, [userId, productId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
};

// 11. Create invoice: sum cart, insert invoice, clear cart
exports.createInvoice = (req, res) => {
  const { userId } = req.params;
  // 1. Sum up cart
  const sumSql = `
    SELECT SUM(K.mnozstvo * T.cena) AS suma
    FROM Kosik K
    JOIN Tovar T ON K.id_tovar = T.id_tovar
    WHERE K.id_pouzivatel = ?`;
  db.query(sumSql, [userId], (err, sumResults) => {
    if (err) return res.status(500).json({ error: err.message });
    const suma = sumResults[0].suma || 0;
    const sumaSDph = +(suma * 1.2).toFixed(2);
    // 2. Insert invoice
    const insertSql = `
      INSERT INTO Faktura
        (id_pouzivatel, datum_vystavenia, datum_splatnosti, suma, suma_s_dph)
      VALUES
        (?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY), ?, ?)`;
    db.query(insertSql, [userId, suma, sumaSDph], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      // 3. Clear cart
      const deleteSql = `DELETE FROM Kosik WHERE id_pouzivatel = ?`;
      db.query(deleteSql, [userId], (err3) => {
        if (err3) return res.status(500).json({ error: err3.message });
        res.json({ success: true, suma, sumaSDph });
      });
    });
  });
};

// 12. Get user invoices
exports.getUserInvoices = (req, res) => {
  const { userId } = req.params;
  const sql = `
    SELECT id_faktura, datum_vystavenia, datum_splatnosti, suma, suma_s_dph
    FROM Faktura
    WHERE id_pouzivatel = ?
    ORDER BY datum_vystavenia DESC`;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// 13. Update stock after purchase
exports.updateStockAfterPurchase = (req, res) => {
  const { userId } = req.params;
  const { storeId } = req.body;
  // fetch cart quantities
  const cartSql = `SELECT id_tovar, mnozstvo FROM Kosik WHERE id_pouzivatel = ?`;
  db.query(cartSql, [userId], (err, items) => {
    if (err) return res.status(500).json({ error: err.message });
    // update each
    const updates = items.map((item) => {
      return new Promise((resolve, reject) => {
        const updSql = `
          UPDATE Sklad
          SET pocet = pocet - ?
          WHERE id_tovar = ? AND id_predajna = ?`;
        db.query(updSql, [item.mnozstvo, item.id_tovar, storeId], (e) => {
          if (e) reject(e);
          else resolve();
        });
      });
    });
    Promise.all(updates)
      .then(() => res.json({ success: true }))
      .catch((e) => res.status(500).json({ error: e.message }));
  });
};

// 14. login
exports.login = (req, res) => {
  const { name, password } = req.body;

  // overiť, či užívateľ poslal meno aj heslo
  if (!name || !password) {
    return res.status(400).json({ error: 'Meno a heslo sú povinné.' });
  }

  const userSql = `
    SELECT id_pouzivatel 
    FROM Bodnar.Pouzivatel 
    WHERE meno = ? AND heslo = ?;
  `;

  db.query(userSql, [name, password], (err, results) => {
    if (err) {
      console.error('DB error pri login:', err);
      return res.status(500).json({ error: 'Interná chyba servera.' });
    }

    if (results.length === 0) {
      // neexistujúce alebo nesprávne prihlasovacie údaje
      return res.status(401).json({ error: 'Nesprávne meno alebo heslo.' });
    }

    // úspešné prihlásenie
    const userId = results[0].id_pouzivatel;
    // sem môžeš pridať vytvorenie session alebo vydanie JWT
    return res.json({ success: true, id_pouzivatel: userId });
  });
};

// 15. register
exports.register = (req, res) => {
  const { name, password, password2 } = req.body;

  // overiť, či prišli všetky polia
  if (!name || !password || !password2) {
    return res.status(400).json({ error: 'Meno, heslo a potvrdenie hesla sú povinné.' });
  }

  // overiť zhodu hesiel
  if (password !== password2) {
    return res.status(400).json({ error: 'Heslá sa nezhodujú.' });
  }

  // skontrolovať, či užívateľ s daným menom neexistuje
  const checkSql = `
    SELECT id_pouzivatel 
    FROM Bodnar.Pouzivatel 
    WHERE meno = ?;
  `;
  db.query(checkSql, [name], (err, results) => {
    if (err) {
      console.error('DB error pri check user:', err);
      return res.status(500).json({ error: 'Interná chyba servera.' });
    }

    if (results.length > 0) {
      // užívateľ existuje
      return res.status(409).json({ error: 'Užívateľ s týmto menom už existuje.' });
    }

    // vložiť nového užívateľa
    const insertSql = `
      INSERT INTO Bodnar.Pouzivatel (meno, heslo)
      VALUES (?, ?);
    `;
    db.query(insertSql, [name, password], (err2, result2) => {
      if (err2) {
        console.error('DB error pri insert user:', err2);
        return res.status(500).json({ error: 'Interná chyba servera.' });
      }

      // úspešná registrácia
      return res.status(201).json({
        success: true,
        id_pouzivatel: result2.insertId
      });
    });
  });
};

