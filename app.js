const express = require('express');
const randomFile = require('select-random-file')

const port = process.env.PORT || 3000;
var app = express();



app.use(express.static('public'))
const dir = __dirname + '/public/images'

app.get('/', (req, res) => {
  randomFile(dir, (err, file) => {
    if (err){
      res.send('404 Error, page not found.')
    }
    else{
      res.send({
        status: 'success',
        message: `http://127.0.0.1:3000/images/${file}`
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
