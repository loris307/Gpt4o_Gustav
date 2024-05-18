const AWS = require('aws-sdk');
const transcribeStreaming = require('aws-transcribe-streaming');


// AWS Konfiguration
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'eu-north-1' // example region
  });

  const transcribeService = new AWS.TranscribeService();

  // Create an Express server
  const express = require('express');
  const app = express();
  
  // Use the `express.raw` middleware to get the audio data as a Buffer
  app.use(express.raw({ type: 'audio/*' }));
  
  app.post('/transcribe', async (req, res) => {
    // Set up the transcription request
    const params = {
      LanguageCode: 'en-US', // or another language code
      MediaSampleRateHertz: 16000, // or another sample rate
      MediaEncoding: 'pcm', // or another encoding
      AudioStream: req.body // the raw audio data
    };
  
    try {
      // Start the transcription
      const transcription = await transcribeService.startStreamTranscription(params).promise();
  
      // Set up a variable to hold the transcription text
      let transcriptionText = '';
  
      // Handle the transcription data
      transcription.TranscriptResultStream.on('data', (event) => {
        if (event.TranscriptEvent) {
          const results = event.TranscriptEvent.Transcript.Results;
          if (results.length > 0) {
            if (results[0].Alternatives.length > 0) {
              transcriptionText += results[0].Alternatives[0].Transcript + ' ';
            }
          }
        }
      });
  
      // Handle the end of the transcription
      transcription.TranscriptResultStream.on('end', () => {
        res.send(transcriptionText);
      });
  
      // Handle errors
      transcription.TranscriptResultStream.on('error', (err) => {
        console.error(err);
        res.status(500).send(err.toString());
      });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.toString());
      }
    });
    
    app.listen(3000, () => {
      console.log('Server started on port 3000');
    });