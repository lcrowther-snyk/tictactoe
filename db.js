const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config()


var Schema = mongoose.Schema;

const url = 'mongodb://127.0.0.1:27017';
const dbName = 'tic-tac-toe';
mongoose.connect(url + "/" + dbName);

let Data = new Schema({
    data: Array,
    player: String,
    type: String,
    name: String
});

const Board = mongoose.model('Board', Data)

const userSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true}
});

const User = mongoose.model('User', userSchema);


// Check if the first user exists
checkAdmin();

async function checkAdmin() {
    var adminUser = await User.findOne({username: 'admin'});
    if (adminUser) {
        //clean up old admin user
        adminUser.deleteOne();
    }
    const newUser = new User({
        username: 'admin',
        password: "snyk2023"
    });
    newUser.save();

}


async function login(username, password) {
    let users = await User.find({username: username, password: password});
    if (users.length > 0) {
        return true;
    } else {
        return false;
    }
}


module.exports = {Board, User, login}
