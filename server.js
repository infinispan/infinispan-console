const path = require('path');
const express = require('express');
const app = express();
const port = 8080;

app.use(express.static(path.join(__dirnamevico, '/dist')));
app.get('*', (req,res) =>{
  res.sendFile(path.join(__dirname + '/dist/index.html'));
});
app.listen(port, () => console.log(`Listening on port ${port}`));
