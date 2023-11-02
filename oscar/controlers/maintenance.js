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
const getMaintenanceHistoric = (req, res) => {
    connection.query('SELECT materiel.idMateriel, materiel.nomMateriel, maintenance.idMaintenance, maintenance.debutMaintenance, maintenance.finMaintenance, maintenance.coutMaintenance FROM maintenance INNER JOIN materiel ON maintenance.idMateriel = materiel.idMateriel WHERE maintenance.statutMaintenance=1', (error, rows) => {
        if (error) {
            return res.status(500).json({ message: 'Une erreur s\'est produite lors de la récupération de l\'historique des maintenances.' });
        }

        res.status(200).json(rows);
    });
};

//Effacer historique
const deleteHistoric = (req, res) => {
    const idMaintenance = parseInt(req.params.idMaintenance);
    // Supprimer la réparation
    connection.query('DELETE FROM maintenance WHERE idMaintenance = ?', [idMaintenance], (errDelete, resultsDelete) => {
        if (errDelete) {
            return res.status(500).json({ message: 'Une erreur s\'est produite lors de la suppression de la maintenance.' });
        }

        res.status(200).json({ message: 'Historique maintenance supprimée avec succès et disponibilité mise à jour.' });
    });
}

//affichage
const getMaintenance = (req, res) => { 
    connection.query('SELECT materiel.idMateriel, materiel.nomMateriel, maintenance.idMaintenance, maintenance.debutMaintenance, maintenance.finMaintenance, maintenance.coutMaintenance FROM maintenance INNER JOIN materiel ON maintenance.idMateriel = materiel.idMateriel WHERE maintenance.statutMaintenance=0', (error, rows) => {
        if (error) {
            return res.status(500).json({ message: 'Une erreur s\'est produite lors de la récupération des maintenances.' });
        }

        res.status(200).json(rows);
    })
}

//Creation
const createMaintenance = (req, res) => {
    const { idMateriel, debutMaintenance, finMaintenance, coutMaintenance } = req.body

    connection.query('SELECT idMaintenance FROM maintenance WHERE idMateriel = ? AND statutMaintenance = 0', [idMateriel], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Une erreur s\'est produite.' });
        }

        if (results.length > 0) {
            return res.status(402).json({ message: 'Doublons, ce matériel est encore en maintenance.' });
        }

        // Aucun doublon, insérer la nouvelle maintenance
        connection.query('INSERT INTO maintenance (idMateriel, debutMaintenance, finMaintenance, coutMaintenance, statutMaintenance) VALUES (?,?,?,?,0)',
            [idMateriel, debutMaintenance, finMaintenance, coutMaintenance],
            (err, results) => {
                if (err) {
                    return res.status(500).json({ message: 'Une erreur s\'est produite.' });
                }

                // Mettre à jour la disponibilité du matériel
                connection.query('UPDATE materiel SET disponibilite = 4 WHERE idMateriel = ?', [idMateriel], (err, results) => {
                    if (err) {
                        return res.status(500).json({ message: 'Une erreur s\'est produite.' });
                    }
                    
                    res.status(201).json({ message: 'Maintenance ajoutée avec succès. Disponibilité 4 activée.' });
                });
            }
        );
    });
    
};


//Modification
const updateMaintenance = (req, res) => {
    const idMaintenance = parseInt(req.params.idMaintenance)
    const { debutMaintenance, finMaintenance, coutMaintenance } = req.body

    connection.query(
        'UPDATE maintenance SET debutMaintenance = (?), finMaintenance = (?), coutMaintenance = (?) WHERE idMaintenance = (?)',
        [debutMaintenance, finMaintenance, coutMaintenance, idMaintenance],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Une erreur s\'est produite lors de la modification de la réparation.' });
            }
            res.status(200).json({ message: 'Maintenance modifiée avec succès.' });
        }
    )
}

//Suppression
const deleteMaintenance = (req, res) => {
    const idMaintenance = parseInt(req.params.idMaintenance)
    const idMateriel = parseInt(req.params.idMateriel);

     // Mettre à jour la disponibilité du matériel
     connection.query('UPDATE materiel SET disponibilite = 1 WHERE idMateriel = ?', [idMateriel], (errUpdate, resultsUpdate) => {
        if (errUpdate) {
            return res.status(500).json({ message: 'Une erreur s\'est produite lors de la mise à jour de la disponibilité.' });
        }

        // Supprimer la maintenance
        connection.query('DELETE FROM maintenance WHERE idMaintenance = ?', [idMaintenance], (errDelete, resultsDelete) => {
            if (errDelete) {
                return res.status(500).json({ message: 'Une erreur s\'est produite lors de la suppression de la maintenance.' });
            }

            res.status(200).json({ message: 'Maintenance supprimée avec succès et disponibilité mise à jour.' });
        });
    });

};

//fin maintenance
const finMaintenance = (req, res) => {
    const idMaintenance = parseInt(req.params.idMaintenance);
    const idMateriel = parseInt(req.params.idMateriel);

    // Mettre à jour la disponibilité du matériel
    connection.query(
        'UPDATE materiel SET disponibilite = 1 WHERE idMateriel = ?',
        [idMateriel],
        (errMateriel, resultsMateriel) => {
            if (errMateriel) {
                return res.status(500).json({ message: 'Une erreur s\'est produite lors de la mise à jour de la disponibilité du matériel.' });
            }

            // Mettre à jour le statut de la maintenance
            connection.query(
                'UPDATE maintenance SET statutMaintenance = 1 WHERE idMaintenance = ?',
                [idMaintenance],
                (errMaintenance, resultsMaintenance) => {
                    if (errMaintenance) {
                        return res.status(500).json({ message: 'Une erreur s\'est produite lors de la mise à jour du statut de la maintenance.' });
                    }

                    res.status(200).json({ message: 'Maintenance terminée avec succès. Matériel mis à jour.' });
                }
            );
        }
    );
};

module.exports = {
    getMaintenance,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
    finMaintenance,
    getMaintenanceHistoric,
    deleteHistoric
}