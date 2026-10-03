const env = require('./src/config/env');
const app = require('./src/app');

app.listen(env.port, () => {
  console.log(`School-Sup API : http://localhost:${env.port}/api/health`);
});