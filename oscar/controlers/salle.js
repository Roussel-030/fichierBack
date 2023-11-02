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
const getSalle = (req, res) => {
    connection.query("SELECT * FROM salle", (error, rows) => {
        if (error) {
            throw error
        }
        res.status(200).json(rows)
    })
}

//Creation
const createSalle = (req, res) => {
    const { libelleSalle } = req.body
    connection.query('INSERT INTO salle (libelleSalle) VALUES (?)', [libelleSalle], (err, results) => {
        if (err) {
            throw err
        }
        res.status(201).send('Salle ajouter avec succes')
    })
}

//Modification
const updateSalle = (req, res) => {
    const idSalle = parseInt(req.params.idSalle)
    const { libelleSalle } = req.body

    connection.query(
        'UPDATE salle SET  libelleSalle = (?) WHERE idSalle = (?)',
        [libelleSalle, idSalle],
        (err, results) => {
            if (err) {
                throw err
            }
            res.status(200).send('Salle modifier avec succes')
        }
    )
}

//Suppression
const deleteSalle = (req, res) => {
    const idSalle = parseInt(req.params.idSalle)

    connection.query('DELETE FROM salle WHERE idSalle = (?)', [idSalle], (err, results) => {
        if (err) {
            throw err
        }
        res.status(200).send('Salle supprimer avec succes')
    })
}

module.exports = {
    getSalle,
    createSalle,
    updateSalle,
    deleteSalle
}