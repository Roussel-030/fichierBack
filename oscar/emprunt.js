//Connexion a la base
const mysql = require('mysql')
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'materiels_pedagogique'
})
/************************************************************/

//affichage historique
const getEmpruntHistoric = (req, res) => {
    connection.query('SELECT emprunt.idEmprunteur, emprunt.idSalle, emprunt.idMateriel, emprunt.debutEmprunt, emprunt.finEmprunt, emprunt.retourReelEmprunt,emprunteur.nomEmprunteur, salle.libelleSalle, materiel.nomMateriel  FROM emprunt INNER JOIN emprunteur ON emprunt.idEmprunteur = emprunteur.idEmprunteur INNER JOIN salle ON emprunt.idSalle = salle.idSalle INNER JOIN materiel ON emprunt.idMateriel = materiel.idMateriel WHERE emprunt.statutEmprunt=1', (error, rows) => {
        if (error) {
            return res.status(500).json({ message: 'Une erreur s\'est produite lors de la récupération de l\'historique des emprunts.' });
        }

        res.status(200).json(rows);
    });
};

//Effacer historique
const deleteHistoric = (req, res) => {
    const idEmprunteur = parseInt(req.params.idEmprunteur)
    const idSalle = parseInt(req.params.idSalle)
    const idMateriel = parseInt(req.params.idMateriel)
    const debutEmprunt = req.params.debutEmprunt
    // Supprimer la réparation
    connection.query('DELETE FROM emprunt WHERE (idEmprunteur = (?) AND idSalle = (?) AND idMateriel = (?) AND debutEmprunt = (?))', [idEmprunteur, idSalle, idMateriel, debutEmprunt], (errDelete, resultsDelete) => {
        if (errDelete) {
            return res.status(500).json({ message: 'Une erreur s\'est produite lors de la suppression de l\'emprunt.' });
        }

        res.status(200).json({ message: 'Historique emprunt supprimée' });
    });
}

//affichage
const getEmprunt = (req, res) => {
    connection.query('SELECT emprunt.idEmprunteur, emprunt.idSalle, emprunt.idMateriel, emprunt.debutEmprunt, emprunt.finEmprunt, emprunt.retourReelEmprunt,emprunteur.nomEmprunteur, salle.libelleSalle, materiel.nomMateriel  FROM emprunt INNER JOIN emprunteur ON emprunt.idEmprunteur = emprunteur.idEmprunteur INNER JOIN salle ON emprunt.idSalle = salle.idSalle INNER JOIN materiel ON emprunt.idMateriel = materiel.idMateriel WHERE emprunt.statutEmprunt=0',
        (error, rows) => {
            if (error) {
                return res.status(500).json({ message: 'Une erreur s\'est produite lors de la récupération des réparations.' });
            }
    
            res.status(200).json(rows);
        });
};


//Creation
const createEmprunt = (req, res) => {
    const { idEmprunteur, idSalle, idMateriel, debutEmprunt, finEmprunt, retourReelEmprunt } = req.body

    connection.query('SELECT idEmprunteur FROM emprunt WHERE idMateriel = ? AND statutEmprunt = 0', [idMateriel], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Une erreur s\'est produite.' });
        }

        if (results.length > 0) {
            return res.status(402).json({ message: 'Doublons, ce matériel est encore emprunté.' });
        }

        // Aucun doublon, insérer le nouvel emprunt
        connection.query('INSERT INTO emprunt (idEmprunteur, idSalle, idMateriel, debutEmprunt, finEmprunt, retourReelEmprunt, statutEmprunt ) VALUES (?,?,?,?,?,?,0)',
            [idEmprunteur, idSalle, idMateriel, debutEmprunt, finEmprunt, retourReelEmprunt],
            (err, results) => {
                if (err) {
                    return res.status(500).json({ message: 'Une erreur s\'est produite.' });
                }

                // Mettre à jour la disponibilité du matériel
                connection.query('UPDATE materiel SET disponibilite = 2 WHERE idMateriel = ?', [idMateriel], (err, results) => {
                    if (err) {
                        return res.status(500).json({ message: 'Une erreur s\'est produite.' });
                    }
                    
                    res.status(201).json({ message: 'Emprunt ajouté avec succès. Disponibilité 2 activée.' });
                });
            }
        );
    });

}



//Modification
const updateEmprunt = (req, res) => {

    const { idEmprunteur, idSalle, idMateriel, debutEmprunt, finEmprunt, retourReelEmprunt } = req.body
    
    connection.query(
        'UPDATE emprunt SET finEmprunt = (?), retourReelEmprunt = (?) WHERE (idEmprunteur = (?) AND idSalle = (?) AND idMateriel = (?) AND debutEmprunt = (?))',
        [finEmprunt, retourReelEmprunt,idEmprunteur,idSalle,idMateriel,debutEmprunt],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Une erreur s\'est produite lors de la modification de l\'emprunt.' });
            }
            res.status(200).json({ message: 'Emprunt modifiée avec succès.' });
        }
    );
};


//Suppression
const deleteEmprunt = (req, res) => { 
    const idEmprunteur = parseInt(req.params.idEmprunteur)
    const idSalle = parseInt(req.params.idSalle)
    const idMateriel = parseInt(req.params.idMateriel)
    const debutEmprunt = req.params.debutEmprunt

    // Mettre à jour la disponibilité du matériel
    connection.query('UPDATE materiel SET disponibilite = 1 WHERE idMateriel = ?', [idMateriel], (errUpdate, resultsUpdate) => {
        if (errUpdate) {
            return res.status(500).json({ message: 'Une erreur s\'est produite lors de la mise à jour de la disponibilité.' });
        }

        // Supprimer l'emprunt
        connection.query('DELETE FROM emprunt WHERE (idEmprunteur = (?) AND idSalle = (?) AND idMateriel = (?) AND debutEmprunt = (?))', [idEmprunteur, idSalle, idMateriel, debutEmprunt], (errDelete, resultsDelete) => {
            if (errDelete) {
                return res.status(500).json({ message: 'Une erreur s\'est produite lors de la suppression de l\'emprunt.' });
            }

            res.status(200).json({ message: 'Emprunt supprimée avec succès et disponibilité mise à jour.' });
        });
    });
};


//fin emprunt
const finEmprunt = (req, res) => {

    const { idEmprunteur, idSalle, idMateriel, debutEmprunt } = req.body

    // Mettre à jour la disponibilité du matériel
    connection.query(
        'UPDATE materiel SET disponibilite = 1 WHERE idMateriel = ?',
        [idMateriel],
        (errMateriel, resultsMateriel) => {
            if (errMateriel) {
                return res.status(500).json({ message: 'Une erreur s\'est produite lors de la mise à jour de la disponibilité du matériel.' });
            }

            // Mettre à jour le statut de l'emprunt
            connection.query(
                'UPDATE emprunt SET statutEmprunt = 1 WHERE (idEmprunteur = (?) AND idSalle = (?) AND idMateriel = (?) AND debutEmprunt = (?)) ',
                [idEmprunteur, idSalle, idMateriel, debutEmprunt],
                (errEmprunt, resultsEmprunt) => {
                    if (errEmprunt) {
                        return res.status(500).json({ message: 'Une erreur s\'est produite lors de la mise à jour du statut de l\'emprunt.' });
                    }

                    res.status(200).json({ message: 'Emprunt terminée avec succès. Matériel mis à jour.' });
                }
            );
        }
    );
};


module.exports = {
    getEmprunt,
    createEmprunt,
    updateEmprunt,
    deleteEmprunt,
    finEmprunt,
    getEmpruntHistoric,
    deleteHistoric
}