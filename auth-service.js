var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const bcrypt = require('bcryptjs')

var userSchema = new Schema({
    "username" : {
        "type" : String,
        "unique" : true
    },
    "password" : String,
    "email" : String,
    "loginHistory" : {
        "dateTime" : Date,
        "UserAgent" : String
    }
})

let User;

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://amaniyakku:FakUmL35u3cp1VYI@senecaweb.bqfms.mongodb.net/?retryWrites=true&w=majority");
        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
            User = db.model("users", userSchema);
            resolve();
        });
    });
};


module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {
        if(userData.password === userData.password2) {
            bcrypt.hash(userData.password, 10).then(hash => {
                userData.password = hash;
                let newUser = new User(userData);

             newUser.save().then(() => {
                resolve();
                }).catch((err) => {
                if (err.code && err.code === 11000) {
                    reject("Username already taken")
                } else {
                    reject('There was an error creating the user: ' + err)
                }
                })
            }).catch(err => {
                reject('There was an error encryting the password')
            })
        }
        else {
            reject('Password do not match');
        }
    })
}

module.exports.checkUser = function (userData) {
    return new Promise(function (resolve, reject) {
        User.find({username: userData.username})
        .exec()
        .then((data) => {
            console.log(data)
            bcrypt.compare(userData.password, data.password).then((result) => {
                data.loginHistory.push({dateTime: (new Date()).toString(), UserAgent: userData.userAgent})

                User.updateOne(
                    { username : data.userName},
                    { $set: {loginHistory: data.loginHistory}}
                ).exec()
                .then((data) => {
                    resolve(data);
                }).catch((err) => {
                    reject('There was an error verifying the user: ' + err)
                })
            })
            .catch((result) => {
                reject('Incorrect Password for user: ' + userData.username)
            })
        }).catch((err) => {
            reject('Unable to find user: ' +  userData.username);
        })
    })
}