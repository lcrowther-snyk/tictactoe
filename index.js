const express = require('express');
const bodyParser = require('body-parser');
const app = express();
var mongoose = require('mongoose');
const session = require('express-session');
var Schema   = mongoose.Schema;

const url = 'mongodb://localhost:27017';
const dbName = 'tic-tac-toe';
mongoose.connect(url+"/"+dbName);

// Set up session middleware
app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: true
}));

var Data = new Schema({
    data: Array,
    player: String
});

var Board = mongoose.model('Board', Data);

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

var User = mongoose.model('User', userSchema);

// REST API to save game data to MongoDB
app.post('/api/save/:player', express.json(), function(req, res) {
    const player = req.params.player;
    new Board({
        data:  req.body,
        player: player
    }).save();
});

// REST API to save game data to MongoDB
app.get('/api/games', express.json(), function(req, res) {
    Board.find()
        .then((boards) => {
            if(boards){
                console.log(boards);
                res.json(boards);
            }
        })
        .catch((err) => {
            //When there are errors We handle them here
            console.log(err);
            res.send(400, "Bad Request");
        });
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

let board;
let player;

app.get('/', (req, res) => {
    board = [];
    player = 'X\'s turn';
    res.render('index', { board: board,player: player });
});
app.get('/board/:id',async (req, res) => {
    const boardid = req.params.id;
    const loadboard = await Board.findOne({_id:boardid}).exec();
    console.log(loadboard)
    boarddata=JSON.parse(JSON.stringify(loadboard.data));
    newmessage = loadboard.player+' WON!';
    res.render('index', { board: boarddata,player: newmessage });
});

app.get('/admin',requireAuth, async (req, res) => {
    // query the database to get all collections
    const boards = await Board.find();
    // render the collections in the EJS template
    res.render('admin', { boards });
});

app.post('/delete',requireAuth, async (req, res) => {
    const ids = req.body['ids[]'];;
    try {
        await Board.deleteMany({ _id: { $in: ids } });
        res.redirect('/');
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
    var username =  req.body.username;
    var password =  req.body.password;
    users = await User.find({ username: username, password: password  });
    if (users.length > 0) {
        req.session.authenticated  = true;
        return res.redirect("/admin")
    }
    else {
        return res.redirect("/login")
    }
});

// Check if the first user exists
checkAdmin();

app.listen(3000, () => console.log('Server started on port 3000'));

async function checkAdmin() {
    var adminUser = await User.findOne({username: 'admin'});
    if (!adminUser) {
        const newUser = new User({
            username: 'admin',
            password: 'snyk2023'
        });
        newUser.save();
    }

}
function requireAuth(req, res, next) {
    if (req.session.authenticated) {
        next();
    } else {
        res.redirect('/login');
    }
}

