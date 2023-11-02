//Connexion a la base
const mysql = require('mysql')
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'materiels_pedagogique'
})
/************************************************************/

//affichage
const getEmprunteur = (req, res) => {
    connection.query('SELECT * FROM emprunteur', (error, rows) => {
        if (error) {
            throw error
        }
        res.status(200).json(rows)
    })
}

//Creation
const createEmprunteur = (req, res) => {
    const { nomEmprunteur, phoneEmprunteur, emailEmprunteur, statutEmprunteur } = req.body
    connection.query('INSERT INTO emprunteur (nomEmprunteur, phoneEmprunteur, emailEmprunteur, statutEmprunteur) VALUES (?,?,?,?)',
        [nomEmprunteur, phoneEmprunteur, emailEmprunteur, statutEmprunteur], (err, results) => {
            if (err) {
                throw err
            }
            res.status(201).send('Emprunteur ajouter avec succes')
        })
}

//Modification
const updateEmprunteur = (req, res) => {
    const idEmprunteur = parseInt(req.params.idEmprunteur)
    const { nomEmprunteur, phoneEmprunteur, emailEmprunteur, statutEmprunteur } = req.body

    connection.query(
        'UPDATE emprunteur SET  nomEmprunteur = (?), phoneEmprunteur = (?), emailEmprunteur = (?), statutEmprunteur = (?) WHERE idEmprunteur = (?)',
        [nomEmprunteur, phoneEmprunteur, emailEmprunteur, statutEmprunteur, idEmprunteur],
        (err, results) => {
            if (err) {
                throw err
            }
            res.status(200).send('Emprunteur modifier avec succes')
        }
    )
}

//Suppression
const deleteEmprunteur = (req, res) => {
    const idEmprunteur = parseInt(req.params.idEmprunteur);
  
    connection.beginTransaction((err) => {
      if (err) {
        throw err;
      }
  
      connection.query(
        'DELETE emprunteur, emprunt ' +
        'FROM emprunteur ' +
        'LEFT JOIN emprunt ON emprunteur.idEmprunteur = emprunt.idEmprunteur ' +
        'WHERE emprunteur.idEmprunteur = ?',
        [idEmprunteur],
        (err, results) => {
          if (err) {
            connection.rollback(() => {
              throw err;
            });
          } else {
            connection.commit((commitErr) => {
              if (commitErr) {
                connection.rollback(() => {
                  throw commitErr;
                });
              }
              res.status(200).send('Emprunteur supprimé avec succès');
            });
          }
        }
      );
    });
}
  

module.exports = {
    getEmprunteur,
    createEmprunteur,
    updateEmprunteur,
    deleteEmprunteur
}