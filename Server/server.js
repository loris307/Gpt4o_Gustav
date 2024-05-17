const AWS = require('aws-sdk');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

const upload = multer();
const app = express();
app.use(bodyParser.json());

// AWS Konfiguration
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'eu-north-1' // example region
  });

const transcribeService = new AWS.TranscribeService();

app.post('/transcribe', upload.single('audio'), (req, res) => {
  const params = {
    LanguageCode: 'en-US',             // Oder andere unterstützte Sprache
    Media: {
      MediaFileUri: req.file.buffer    // Hier der Buffer des Audio-Streams
    },
    MediaFormat: 'mp3',                // Oder das Format Ihrer Audio-Datei
    TranscriptionJobName: 'Transkribierung' + Date.now()  // Eindeutiger Name des Transkriptionsjobs
  };

  transcribeService.startTranscriptionJob(params, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      res.status(500).send(err);
    } else {
      res.send(data);
    }
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});


