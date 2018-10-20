var express = require('express');
var http = require('http');
var mysql = require('mysql')
var app = express();
var bodyParser = require('body-parser');
var dateFormat = require('dateformat');
/*
* Parse all form data
*/
app.use(bodyParser.urlencoded({ extended: true }));

var now = new Date();

/*
* This is the view engine
* Template parsing
* We are using ejs types
*/

app.set('view engine', 'ejs');

/*
* Import all the related JavaScript and Css files to inject in our app.
*/
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/tether/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/css', express.static(__dirname + '/node_modules/font-awesome/css'));
app.use('/fonts', express.static(__dirname + '/node_modules/font-awesome/fonts'));


/*
* Database connection
*/
const conn = mysql.createConnection({
  host: 'mysql-dev',
  user: 'root',
  password: 'root',
  database: 'node_crud'
});

conn.connect(function(err) {
  if (err){
    // Server will restart until database connection succeds
    console.log('Cannot connect with database');
  }else{
    // Docker container will restart if database is not yet ready for connectivity
    conn.query('CREATE TABLE IF NOT EXISTS events( e_id INT NOT NULL AUTO_INCREMENT, e_name VARCHAR(100) NOT NULL, e_start_date DATE NOT NULL, e_end_date DATE NOT NULL, e_added_date DATE, e_desc TEXT, e_location VARCHAR(200), PRIMARY KEY(e_id))');

    /*
    *** GLOBAL site title and base url
    */
    const siteTitle = 'Manjil Tamang | Simple node crud app with mysql and docker';

    /*
    * Express router
    * Show list of events
    */
    app.get('/', function(req, res){
      conn.query("SELECT * FROM events ORDER BY e_start_date DESC", function(err, result){
        res.render('pages/index', {
          siteTitle: siteTitle,
          pageTitle: 'Events list',
          items: result
        });
      });
    });

    /* Show add page */
    app.get('/event/add', function(req, res){
      res.render('pages/add-event', {
        siteTitle: siteTitle,
        pageTitle: 'Add new event',
        items: ''
      });
    });

    /* Post event to database */
    app.post('/event/add', function(req, res){
      /*
      ** Get the record
      */
      var query = 'INSERT INTO events ( e_name, e_start_date, e_end_date,e_added_date, e_desc, e_location) values (';
      query += ' "'+req.body.e_name+'", ';
      query += ' "'+dateFormat(req.body.e_start_date, "yyyy-mm-dd")+'", ';
      query += ' "'+dateFormat(req.body.e_end_date, "yyyy-mm-dd")+'", ';
      query += ' "'+dateFormat(now, "yyyy-mm-dd")+'", ';
      query += ' "'+req.body.e_desc+'", ';
      query += ' "'+req.body.e_location+'"';
      query += ' )';
      conn.query(query, function(err, result){
        res.redirect('/');
      });
    });

    /* Event edit page */
    app.get('/event/edit/:id', function(req, res){
      /* Fetching the event from id */
      conn.query('SELECT * FROM events WHERE e_id = "'+req.params.id+'"', function(err, result){
        // format date
        result[0].e_start_date = dateFormat(result[0].e_start_date, "yyyy-mm-dd");
        result[0].e_end_date = dateFormat(result[0].e_end_date, "yyyy-mm-dd");

        res.render('pages/edit-event', {
          siteTitle: siteTitle,
          pageTitle: 'Edit event: '+result[0].e_name,
          item: result[0]
        });
      });
    });

    // Edit event
    app.post('/event/edit', function(req, res){
      /*
      ** Get the record
      */
      var query = 'UPDATE events SET';
      query += ' e_name = "'+req.body.e_name+'", ';
      query += ' e_start_date = "'+dateFormat(req.body.e_start_date, "yyyy-mm-dd")+'", ';
      query += ' e_end_date = "'+dateFormat(req.body.e_end_date, "yyyy-mm-dd")+'", ';
      query += ' e_desc = "'+req.body.e_desc+'", ';
      query += ' e_location = "'+req.body.e_location+'"';
      query += ' WHERE e_id = '+req.body.e_id;

      conn.query(query, function(err, result){
        if(result.affectedRows){
          res.redirect('/');
        }
      });
    });

    /* Event edit page */
    app.get('/event/delete/:id', function(req, res){
      /* Fetching the event from id */
      conn.query('DELETE FROM events WHERE e_id = "'+req.params.id+'"', function(err, result){
        if(result.affectedRows){
          res.redirect('/');
        }
      });
    });

    /*
    * Creating a server
    */

    app.listen(3000, function(){
      console.log('Server started on port 3000 | 8080 if running on docker...');
    });

  }
});
