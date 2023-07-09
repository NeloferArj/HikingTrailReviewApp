const mongoose = require('mongoose');
const places  = require('./seedHelpers');
const cities = require('./cities')
const Restaurant = require('../models/Restaurant');
const { urlencoded } = require('express');
const axios = require('axios').default;

mongoose.connect('mongodb://localhost:27017/yelp', {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});



// {"URL":"http://www.just-eat.co.uk/restaurants-1st-choice-pizza-ws11/menu",
// "_id":{"$oid":"55f14312c7447c3da7051b3b"},
// "address":"1 Walsall Road",
// "address line 2":"Cannock",
// "name":"1st Choice Pizza",
// "outcode":"WS11",
// "postcode":"0HG",
// "rating":4,
// "type_of_food":"Pizza"},


// const chips = new Resturant({name: "chips", location:"naperville", description: "chips food"});
// chips.save().then(() => console.log('saved to db'));



// const sample = array => array[Math.floor(Math.random() * array.length)];
async function seedImg() {
  try {
    const resp = await axios.get('https://api.unsplash.com/photos/random', {
      params: {
        client_id: 'OcXjrKj_UyctpKxmCC5NugMpqaGZFkRKblEO4KI-XLM',
        collections: 622228,
      },
    })
    return resp.data.urls.small
  } catch (err) {
    console.error(err)
  }
}

const seedDB = async () => {
    await Restaurant.deleteMany({});
    for (let i = 0; i < 1; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const restaurant = new Restaurant({
            imgURL: await seedImg(),
            name: `${places[random1000].name}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            description: `${places[random1000].type_of_food},`,
            author:'62fae847d4e7f92bc232293c' //aa //aa
            // reviews: []
        })
        await restaurant.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
