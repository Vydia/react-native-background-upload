const express = require('express')
const app = express()
const port = 8080

const delay = t => new Promise(res => setTimeout(() => res(), t));

export const startTestServer = () => {
  app.put('/10secDelay', async (_, response) => {
    await delay(10000);
    response.status(200).end();
  });

  app.put('/5secDelayFail', async (_, response) => {
    await delay(5000);
    response.status(502).end();
  });

  return app.listen(port, () => console.log(`Server listening on port ${port}!`))
};
