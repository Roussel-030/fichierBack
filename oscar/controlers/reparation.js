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
const getReparationHistoric = (req, res) => {
    connection.query('SELECT materiel.idMateriel, materiel.nomMateriel, reparation.idReparation, reparation.debutReparation, reparation.finReparation, reparation.coutReparation FROM reparation INNER JOIN materiel ON reparation.idMateriel = materiel.idMateriel WHERE reparation.statutReparation=1', (error, rows) => {
        if (error) {
            return res.status(500).json({ message: 'Une erreur s\'est produite lors de la récupération de l\'historique des réparations.' });
        }

        res.status(200).json(rows);
    });
};

//Effacer historique
const deleteHistoric = (req, res) => {
    const idReparation = parseInt(req.params.idReparation);
    // Supprimer la réparation
    connection.query('DELETE FROM reparation WHERE idReparation = ?', [idReparation], (errDelete, resultsDelete) => {
        if (errDelete) {
            return res.status(500).json({ message: 'Une erreur s\'est produite lors de la suppression de la réparation.' });
        }

        res.status(200).json({ message: 'Historique réparation supprimée avec succès et disponibilité mise à jour.' });
    });
}

//affichage
const getReparation = (req, res) => {
    connection.query('SELECT materiel.idMateriel, materiel.nomMateriel, reparation.idReparation, reparation.debutReparation, reparation.finReparation, reparation.coutReparation FROM reparation INNER JOIN materiel ON reparation.idMateriel = materiel.idMateriel WHERE reparation.statutReparation=0', (error, rows) => {
        if (error) {
            return res.status(500).json({ message: 'Une erreur s\'est produite lors de la récupération des réparations.' });
        }

        res.status(200).json(rows);
    });
};

//Creation
const createReparation = (req, res) => {
    const { idMateriel, debutReparation, finReparation, coutReparation } = req.body;

    connection.query('SELECT idReparation FROM reparation WHERE idMateriel = ? AND statutReparation = 0', [idMateriel], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Une erreur s\'est produite.' });
        }

        if (results.length > 0) {
            return res.status(402).json({ message: 'Doublons, ce matériel est encore en réparation.' });
        }

        // Aucun doublon, insérer la nouvelle réparation
        connection.query('INSERT INTO reparation (idMateriel, debutReparation, finReparation, coutReparation, statutReparation) VALUES (?,?,?,?,0)',
            [idMateriel, debutReparation, finReparation, coutReparation],
            (err, results) => {
                if (err) {
                    return res.status(500).json({ message: 'Une erreur s\'est produite.' });
                }

                // Mettre à jour la disponibilité du matériel
                connection.query('UPDATE materiel SET disponibilite = 3 WHERE idMateriel = ?', [idMateriel], (err, results) => {
                    if (err) {
                        return res.status(500).json({ message: 'Une erreur s\'est produite.' });
                    }
                    
                    res.status(201).json({ message: 'Réparation ajoutée avec succès. Disponibilité 3 activée.' });
                });
            }
        );
    });
};


//Modification
const updateReparation = (req, res) => {
    const idReparation = parseInt(req.params.idReparation);
    const { debutReparation, finReparation, coutReparation } = req.body;

    connection.query(
        'UPDATE reparation SET debutReparation = ?, finReparation = ?, coutReparation = ? WHERE idReparation = ?',
        [debutReparation, finReparation, coutReparation, idReparation],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Une erreur s\'est produite lors de la modification de la réparation.' });
            }
            res.status(200).json({ message: 'Réparation modifiée avec succès.' });
        }
    );
};


//Suppression
const deleteReparation = (req, res) => {
    const idReparation = parseInt(req.params.idReparation);
    const idMateriel = parseInt(req.params.idMateriel);

    // Mettre à jour la disponibilité du matériel
    connection.query('UPDATE materiel SET disponibilite = 1 WHERE idMateriel = ?', [idMateriel], (errUpdate, resultsUpdate) => {
        if (errUpdate) {
            return res.status(500).json({ message: 'Une erreur s\'est produite lors de la mise à jour de la disponibilité.' });
        }

        // Supprimer la réparation
        connection.query('DELETE FROM reparation WHERE idReparation = ?', [idReparation], (errDelete, resultsDelete) => {
            if (errDelete) {
                return res.status(500).json({ message: 'Une erreur s\'est produite lors de la suppression de la réparation.' });
            }

            res.status(200).json({ message: 'Réparation supprimée avec succès et disponibilité mise à jour.' });
        });
    });
};



//fin reparation
const finReparation = (req, res) => {
    const idReparation = parseInt(req.params.idReparation);
    const idMateriel = parseInt(req.params.idMateriel);

    // Mettre à jour la disponibilité du matériel
    connection.query(
        'UPDATE materiel SET disponibilite = 1 WHERE idMateriel = ?',
        [idMateriel],
        (errMateriel, resultsMateriel) => {
            if (errMateriel) {
                return res.status(500).json({ message: 'Une erreur s\'est produite lors de la mise à jour de la disponibilité du matériel.' });
            }

            // Mettre à jour le statut de la réparation
            connection.query(
                'UPDATE reparation SET statutReparation = 1 WHERE idReparation = ?',
                [idReparation],
                (errReparation, resultsReparation) => {
                    if (errReparation) {
                        return res.status(500).json({ message: 'Une erreur s\'est produite lors de la mise à jour du statut de la réparation.' });
                    }

                    res.status(200).json({ message: 'Réparation terminée avec succès. Matériel mis à jour.' });
                }
            );
        }
    );
};


module.exports = {
    getReparation,
    createReparation,
    updateReparation,
    deleteReparation,
    finReparation,
    getReparationHistoric,
    deleteHistoric
}