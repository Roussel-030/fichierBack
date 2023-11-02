const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const multer = require('multer')
const port = process.env.PORT || 3000
const app = express()

const salle = require('./controlers/salle')
const emprunteur = require('./controlers/emprunteur')
const materiel = require('./controlers/materiel')
const maintenance = require('./controlers/maintenance')
const reparation = require('./controlers/reparation')
const emprunt = require('./controlers/emprunt')

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)

//Pour écouter des autres port
app.use(cors())


//racine
app.get('/', (req, res) => {
    res.json({ info: 'NodeJs, Express, et MySQL API' })
})

//salle
app.get('/salle', salle.getSalle)
app.post('/salle', salle.createSalle)
app.put('/salle/:idSalle', salle.updateSalle)
app.delete('/salle/:idSalle', salle.deleteSalle)

//emprunteur
app.get('/emprunteur', emprunteur.getEmprunteur)
app.post('/emprunteur', emprunteur.createEmprunteur)
app.put('/emprunteur/:idEmprunteur', emprunteur.updateEmprunteur)
app.delete('/emprunteur/:idEmprunteur', emprunteur.deleteEmprunteur)

//materiel
app.get('/materiel', materiel.getMateriel)
app.get('/detailMateriel/:idMateriel', materiel.detailMateriel)
app.get('/detailMaterielPhoto/:idMateriel',materiel.detailMaterielPhoto)
app.post('/materiel', upload.single('photoMateriel'), materiel.createMateriel)
app.put('/materiel/:idMateriel', upload.single('photoMateriel'), materiel.updateMateriel)
app.delete('/materiel/:idMateriel', materiel.deleteMateriel)

//maintenance
app.get('/maintenance', maintenance.getMaintenance)
app.post('/maintenance', maintenance.createMaintenance)
app.put('/maintenance/:idMaintenance', maintenance.updateMaintenance)
app.put('/maintenance/:idMaintenance/:idMateriel', maintenance.finMaintenance)
app.delete('/maintenance/:idMaintenance/:idMateriel', maintenance.deleteMaintenance)
app.get('/maintenanceHistoric', maintenance.getMaintenanceHistoric)
app.delete('/maintenanceHistoric/:idMaintenance', maintenance.deleteHistoric)


//reparation
app.get('/reparation', reparation.getReparation)
app.post('/reparation', reparation.createReparation)
app.put('/reparation/:idReparation', reparation.updateReparation)
app.put('/reparation/:idReparation/:idMateriel',reparation.finReparation)
app.delete('/reparation/:idReparation/:idMateriel', reparation.deleteReparation)
app.get('/reparationHistoric', reparation.getReparationHistoric)
app.delete('/reparationHistoric/:idReparation', reparation.deleteHistoric)

//emprunt
app.get('/emprunt', emprunt.getEmprunt)
app.post('/emprunt', emprunt.createEmprunt)
app.put('/emprunt', emprunt.updateEmprunt)
app.put('/empruntFin',emprunt.finEmprunt)
app.delete('/emprunt', emprunt.deleteEmprunt)
app.get('/empruntHistoric', emprunt.getEmpruntHistoric)
app.delete('/empruntHistoric', emprunt.deleteHistoric)

//Ecoute sur le port
app.listen(port, () => {
    console.log(`Ecoute sur le port ${port}.`)
})

