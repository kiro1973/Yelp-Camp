const mongoose = require('mongoose');
const cities = require('./cities');
const Campground = require('../models/campground');
const { places, descriptors } = require('./seedHelpers');
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,

  useUnifiedTopology: true,
  //useCreateIndex: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("database conncted")
});
const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 200; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: '633463f0c37e7e4a9e729b9c',
      location: `${cities[random1000].city},${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus tempora repellat id porro dolores ut officiis incidunt totam repellendus numquam voluptas dignissimos alias, sapiente quidem vero! Provident, rerum natus? Molestiae.',
      price,
      geometry: {
        type: 'Point',
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude
        ]
      },
      images: [
        {
          url: 'https://res.cloudinary.com/dv4w6vggf/image/upload/v1664732695/YelpCamp/qx7xp2jdfuxtfwmksgjc.jpg',
          filename: 'YelpCamp/qx7xp2jdfuxtfwmksgjc',
        },
        {
          url: 'https://res.cloudinary.com/dv4w6vggf/image/upload/v1664732697/YelpCamp/bpox4btyjmd7wekraf5z.jpg',
          filename: 'YelpCamp/bpox4btyjmd7wekraf5z',
        },
        {
          url: 'https://res.cloudinary.com/dv4w6vggf/image/upload/v1664732696/YelpCamp/jgcoicrl5puehchkoebf.webp',
          filename: 'YelpCamp/jgcoicrl5puehchkoebf',
        }
      ]

    })
    await camp.save();
  }
}
seedDB().then(() => {
  mongoose.connection.close();
});