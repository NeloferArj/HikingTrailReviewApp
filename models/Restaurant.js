const mongoose = require("mongoose");
const Review = require('./Review')
const Schema = mongoose.Schema;
const User = require('./User')


const RestaurantSchema = new mongoose.Schema({
    name: String,
    location:String,
    description:String,
    imgURL:String,
    //ref basically means that mongoose would store the ObjectId values and when you call populate using those ObjectIds would fetch and fill the documents for you.
    //https://stackoverflow.com/questions/53729465/what-does-ref-means-mongooose#:~:text=ref%20basically%20means%20that%20mongoose,fill%20the%20documents%20for%20you.
    reviews: [
        { type: Schema.Types.ObjectId, ref: 'Review' }
    ],
    author: { type: Schema.Types.ObjectId, ref: 'User' }
});



RestaurantSchema.post('findOneAndDelete', async function (doc) {
    console.log("delete")
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

const Restaurant = mongoose.model("Restaurant", RestaurantSchema);
//mongo will create a collection called restaurants
module.exports = Restaurant
//now you can make new instance of resturant
// chipotle = {name: "chiptole", location:"villa park", description: "mexican food"}