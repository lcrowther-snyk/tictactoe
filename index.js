const express = require('express');
const bodyParser = require('body-parser');
const app = express();
var mongoose = require('mongoose');
const {ObjectId} = require("mongodb");
var Schema   = mongoose.Schema;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');



const url = 'mongodb://localhost:27017';
const dbName = 'tic-tac-toe';
mongoose.connect(url+"/"+dbName);


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


passport.use(new LocalStrategy(
    async function(username, password, done) {
        try {
            const user = await User.findOne({ username: username });
            if (!user) return done(null, false);
            if (password !== user.password) return done(null, false);
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));
app.use(session({
    secret: 'your secret key',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user._id);
    // if you use Model.id as your idAttribute maybe you'd want
    // done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    var user = User.findById(id);
    done(null, user);
});

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

app.get('/admin',isAuthenticated, async (req, res) => {
    // query the database to get all collections
    const boards = await Board.find();
    // render the collections in the EJS template
    res.render('admin', { boards });
});

app.post('/delete',isAuthenticated, async (req, res) => {
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
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});
app.post('/login',
    passport.authenticate('local', { successRedirect: '/admin', failureRedirect: '/login' })
);

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

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