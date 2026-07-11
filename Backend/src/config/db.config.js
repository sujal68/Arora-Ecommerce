const mongoose = require('mongoose');

module.exports = mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Mongo Is Connected");
}).catch((err) => {
    console.log("Mongo Connection Failed!! ", err);
    return false;
});
