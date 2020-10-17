import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

//
// LEARN: serviceAccountKey is downloader from 'https://console.firebase.google.com/project/<PROJECT>/settings/serviceaccounts/adminsdk?hl=es-419'
// We have to copy inside our project, and in de "lib" forder to avoid copy continuosly using "tsc" or similar. Of course a best practice is copy automatically, but not includen in this project.
// 

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://angular-adv-goty.firebaseio.com"
});

const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", { structuredData: true });
    response.json({
        message: 'Hello from Firebase Cloud Functions !'
    });
});


export const getGOTY = functions.https.onRequest(async (request, response) => {
    //const name = request.query.name || 'Unamed';
    // response.json({
    //     name
    // });

    const gotyRef = db.collection('goty');
    const docsSnap = await gotyRef.get();
    const juegos = docsSnap.docs.map(doc => doc.data())

    response.json(juegos);
});


// ******************************************************************
// ********************** Express ***********************************
// ******************************************************************

const app = express();
app.use(cors({ origin: true }));

app.get('/goty', async (req, res) => {

    const gotyRef = db.collection('goty');
    const docsSnap = await gotyRef.get();
    const juegos = docsSnap.docs.map(doc => doc.data())

    res.json(juegos);
});

app.post('/goty/:id', async (req, res) => {

    const id = req.params.id;
    const gameRef = db.collection('goty').doc(id);
    const gameSnap = await gameRef.get();

    if (!gameSnap.exists) {
        res.status(404).json({
            ok: false,
            mensaje: `No game found for id: ${id}`
        });
    } else {

        const previous = gameSnap.data() || { votos: 0 };
        await gameRef.update({
            votos: previous.votos + 1
        });

        res.json({
            ok: true,
            mensaje: `Thansk for your vote '${previous.name}'`
        });
    }
});


export const api = functions.https.onRequest(app);