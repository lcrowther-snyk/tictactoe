const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const session = require('express-session');
const db = require("./db");
var marked = require('marked');
var st = require('st');
const _ = require('lodash');

// Set up middleware
app.use(session({
    secret: Math.random()+'key',
    resave: false,
    saveUninitialized: true
}));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(st({ path: './public', url: '/public' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
marked.setOptions({ sanitize: true });
app.locals.marked = marked;

// REST API to save game data to MongoDB
app.post('/api/save', express.json(), function(req, res) {
    let player = req.body.player;
    let type=req.body.type;
    let name=req.body.name;
    new db.Board({
        data:  req.body.data,
        player: player,
        type: type,
        name: name
    }).save();
});

app.get('/', async (req, res) => {
    const boards = await db.Board.find(); //load previous games
    res.render('index', {board: [], player: 'X\'s turn',boards:boards});
});

app.get('/board/:id',async (req, res) => {
    const boardid = req.params.id;
    const loadboard = await db.Board.findOne({_id:boardid}).exec();
    boarddata=JSON.parse(JSON.stringify(loadboard.data));
    newmessage =loadboard.type=='draw'?"It was a draw!":loadboard.player+' Won!';
    const boards = await db.Board.find(); //load previous games
    res.render('index', { board: boarddata,player: loadboard.name+' ' +newmessage,boards: boards });
});

app.get('/admin',requireAuth, async (req, res) => {
    // query the database to get all collections
    const boards = await db.Board.find();
    // render the collections in the EJS template
    res.render('admin', { boards });
});

app.post('/delete',requireAuth, async (req, res) => {
    const ids = req.body['ids[]'];;
    try {
        await db.Board.deleteMany({ _id: { $in: ids } });
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});
app.get('/logout', function(req, res, next) {
    req.session.destroy();
    res.redirect('/');
});

app.post('/login',async function(req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    if(await db.login(username,password)) {
        req.session.authenticated  = true;
        return res.redirect("/admin")
    }
    else {
        return res.redirect("/login")
    }
});

function requireAuth(req, res, next) {
    let options = {};
    _.merge(options, req.body);

    if(req.session.authenticated)      {
       next();
    } else {
        res.redirect('/login');
    }
}

app.listen(3000, () => console.log('Server started on port 3000'));

