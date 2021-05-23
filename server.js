require('dotenv').config();
const express = require('express');
const app = express();
const pg = require('pg');
const methodOverride = require('method-override');
const superagent = require('superagent');
const cors = require('cors');

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');
const client = new pg.Client(process.env.DATABASE_URL);
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3040;
// const client = new pg.Client({
//   connectionString: process.env.DATABASE_URL,
// ssl: { rejectUnauthorized: false }
// });
// const client = new pg.Client( { connectionString: process.env.DATABASE_URL, ssl: process.env.LOCALLY ? false : {rejectUnauthorized: false}} );
client.connect().then(
  app.listen(PORT, () => {
    console.log(`listenting to ${PORT}`);
  })
);
app.get('/', (req, res) => {
  let url = `https://jobs.github.com/positions.json?location=usa`;
  superagent
    .get(url)
    .then(result => {
      // res.send(result.text);
      let dataJob = result.text.map(item => {
        new Jop(item);
      });
      // console.log(dataJob);
      res.render('home', { data: dataJob });
    })
    .catch(error => res.send(error));
});
// title, company, location, and url

function Jop(item) {
  this.title = item.tilte;
  this.company = item.company;
  this.location = item.location;
  this.url = item.url;
}
