const express = require('express')
const app = express()
const port = 8080

const delay = t => new Promise(res => setTimeout(() => res(), t));

const startTestServer = () => {
  app.put('/10secDelay', async (_, response) => {
    await delay(10000);
    response.status(200).end();
  });

  app.put('/5secDelayFail', async (_, response) => {
    await delay(5000);
    response.status(502).end();
  });

  const contentType = require('content-type')
  const { writeFile } = require('fs')
  const getRawBody = require('raw-body')
  const uuidv4 = require('uuid').v4
  const multer  = require('multer')
  const upload = multer({ dest: 'tmp/multipart/' })

  const helloMessage = 'Hi! The server is listening on port 8080. Use the React Native app to start an upload.'

  app.get('/', function (req, res) {
    res.send(helloMessage)
  })

  app.post('/upload_multipart', upload.single('uploaded_media'), function (req, res) {
    console.log('/upload_multipart')
    console.log(`Received headers: ${JSON.stringify(req.headers)}`)
    console.log(`Wrote to: ${req.file.path}`)
    res.status = 202
    res.end()
  })

  app.post('/upload_raw', function (req, res, next) {
    console.log('/upload_raw')
    console.log(`Received headers: ${JSON.stringify(req.headers)}`)

    getRawBody(req, {
      length: req.headers['content-length'],
      limit: '50mb',
      encoding: contentType.parse(req).parameters.charset
    }, function (err, string) {
      if (err) return next(err)

      const savePath = `tmp/raw/${uuidv4()}`
      console.log(`Writing to: ${savePath}`)

      writeFile(savePath, string, 'binary', function (err) {
        if (err) {
          console.log('Write error:', err)
          res.status = 500
        } else {
          console.log('Wrote file.')
          res.status = 202
        }
        res.end()
      })
    })
  })

  return app.listen(port, () => console.log(`Server listening on port ${port}!`))
};

module.exports = { startTestServer };
