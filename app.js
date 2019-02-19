const express = require('express');
const randomFile = require('select-random-file')

const port = process.env.PORT || 3000;
var app = express();

app.use(function(req,res,next){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Expose-Headers', 'x-auth');
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.setHeader('Access-Control-Allow-Headers','Origin, X-Requested-With,content-type, Accept , x-auth');
	next();
});

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
        message: `https://boiling-hamlet-18186.herokuapp.com/images/${file}`
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
