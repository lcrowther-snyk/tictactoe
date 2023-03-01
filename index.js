const express = require('express');
const bodyParser = require('body-parser');
const app = express();
var mongoose = require('mongoose');
const {ObjectId} = require("mongodb");
var Schema   = mongoose.Schema;



const url = 'mongodb://localhost:27017';
const dbName = 'tic-tac-toe';

var Data = new Schema({
    data: Array,
    player: String
});

var Board = mongoose.model('Board', Data);

mongoose.connect(url+"/"+dbName);

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

app.listen(3000, () => console.log('Server started on port 3000'));
