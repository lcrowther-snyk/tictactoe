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
        password: bcrypt.hashSync( "snyk2023", 10)
    });
    newUser.save();

}


async function login(username, password) {
    let user = await User.findOne({username: username, password: password});
    if (user) {
        //found with encrypted password
        return true;
    }
    user = await User.findOne({username: username});
    if (user) {
        let verified = bcrypt.compareSync(password, user.password);
        if (verified) return true;
    }
    return false;
}


module.exports = {Board, User, login}
