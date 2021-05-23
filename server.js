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
      let dataJob = result.body.map(item => new Jop(item));
      res.render('home', { data: dataJob });
    })
    .catch(error => res.send(error));
});

app.get('/search', (req, res) => {
  res.render('search');
});
app.post('/search', (req, res) => {
  let { description } = req.body;
  let url = `https://jobs.github.com/positions.json?description=${description}&location=usa`;
  superagent
    .get(url)
    .then(result => {
      let dataJob = result.body.map(item => new Jop(item));
      res.render('resultPage', { data: dataJob });
    })
    .catch(error => res.send(error));
});

app.post('/mylistt', (req, res) => {
  let { title, comapany, location, url } = req.body;
  let sql = `insert into joptable (title,comapany,location,url) values($1,$2,$3,$4)`;
  client
    .query(sql, [title, comapany, location, url])
    .then(res.redirect('/mylist'))
    .catch(error => res.send(error));
});

app.get('/mylist', (req, res) => {
  let sql = `select * from joptable;`;
  client
    .query(sql)
    .then(result => {
      res.render('all_list', { data: result.rows });
    })
    .catch(error => res.send(error));
});
app.get('/mylist/:id', (req, res) => {
  let { id } = req.params;
  let sql = `select * from joptable where id=$1;`;
  client
    .query(sql, [id])
    .then(result => {
      res.render('onelist', { data: result.rows });
    })
    .catch(error => res.send(error));
});

app.put('/mylist/:id', (req, res) => {
  let { id } = req.params;
  let { title, comapany, location, url } = req.body;

  let sql = `update joptable set title=$1,comapany=$2,location=$3,url=$4 where id=$5;`;
  client
    .query(sql, [title, comapany, location, url, id])
    .then(result => {
      res.redirect(`/mylist/${id}`);
    })
    .catch(error => res.send(error));
});
app.delete('/mylist/:id', (req, res) => {
  let { id } = req.params;
  let sql = `delete from joptable where id=$1;`;
  client
    .query(sql, [id])
    .then(result => {
      res.redirect(`/mylist`);
    })
    .catch(error => res.send(error));
});

// title, company, location, and url

function Jop(item) {
  this.title = item.title;
  this.company = item.company;
  this.location = item.location;
  this.url = item.url;
}
