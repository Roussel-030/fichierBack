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
const getMateriel = (req, res) => {
    connection.query('SELECT idMateriel, nomMateriel FROM materiel WHERE disponibilite=1', (error, rows) => {
        if (error) {
            return res.status(500).json({ message: 'Une erreur s\'est produite lors de la récupération des matériels.' });
        }

        res.status(200).json(rows);
    })
}

//Détails matériel

const detailMaterielPhoto = (req, res) => {
  const idMateriel = parseInt(req.params.idMateriel);

  connection.query('SELECT photoMateriel FROM materiel WHERE idMateriel=?', [idMateriel], (error, rows) => {
    if (error) {
      return res.status(500).json({ message: 'Une erreur s\'est produite lors de la récupération du détail du matériel.' });
    }

    if (rows.length > 0) {
      const { photoMateriel } = rows[0];
      // Envoyer l'image avec l'en-tête approprié
      res.set('Content-Type', 'image/png'); // Assurez-vous de définir le type de contenu correct (image/png, image/jpeg, etc.)
      res.send(photoMateriel);
    } else {
      res.status(404).json({ message: 'Matériel non trouvé.' });
    }
  });
}


const detailMateriel = (req, res) => {
  const idMateriel = parseInt(req.params.idMateriel)

  connection.query('SELECT nomMateriel, description FROM materiel WHERE idMateriel=?',[idMateriel], (error, rows) => {
    if (error) {
        return res.status(500).json({ message: 'Une erreur s\'est produite lors de la récupération du détail du matériel.' });
    }

    res.status(200).json(rows);
})
}

//Creation 
const createMateriel = (req, res) => {
    const photoMateriel = req.file.buffer
    const { nomMateriel,description} = req.body
    
    connection.query('INSERT INTO materiel (nomMateriel, photoMateriel, description, disponibilite) VALUES (?, ?, ?, 1)', [nomMateriel, photoMateriel, description], (err, results) => {
        if (err) {
                throw err
            }
            res.status(201).send('Materiel ajouter avec succes');
    })
    
}

//Modification
const updateMateriel = (req, res) => {
    const idMateriel = parseInt(req.params.idMateriel)
    const photoMateriel = req.file.buffer
    const { nomMateriel, description} = req.body
    
    connection.query(
        'UPDATE materiel SET  nomMateriel = (?), photoMateriel = (?), description = (?) WHERE idMateriel = (?)',
        [nomMateriel, photoMateriel, description, idMateriel],
        (err, results) => {
            if (err) {
                throw err
            }
                    res.status(200).send('Materiel modifier avec succes')
            }
    )

}

//Suppression
const deleteMateriel = (req, res) => {
    const idMateriel = parseInt(req.params.idMateriel);
  
    connection.beginTransaction((err) => {
      if (err) {
        throw err;
      }
  
      connection.query(
        'DELETE materiel, reparation, maintenance, emprunt ' +
        'FROM materiel ' +
        'LEFT JOIN reparation ON materiel.idMateriel = reparation.idMateriel ' +
        'LEFT JOIN maintenance ON materiel.idMateriel = maintenance.idMateriel ' +
        'LEFT JOIN emprunt ON materiel.idMateriel = emprunt.idMateriel ' +
        'WHERE materiel.idMateriel = ?',
        [idMateriel],
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
              res.status(200).send('Materiel supprimé avec succès');
            });
          }
        }
      );
    });
}

module.exports = {
    getMateriel,
    createMateriel,
    updateMateriel,
    deleteMateriel,
    detailMateriel,
    detailMaterielPhoto
}