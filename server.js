const express = require('express');
const app = express();
const port = 3000;

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port, () => console.log(`App listening on port ${port}!`));
