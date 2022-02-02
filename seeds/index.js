const mongoose = require('mongoose');

//load properties files of Pokemon
const properties = require('./properties.js');


//load Pokemon model
const Pokemon = require('../models/pokemon.js');


//connect to mongoose DB
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/pokemon";
mongoose.connect(dbUrl, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
})
.then(d => {
    console.log("CONNECT TO MONGODB");
})
.catch(err => {
    console.log("ERROR TO CONNECT TO MONGODB");
    console.log(err);
});

//seeds from properties and images
const seedDB = async() => {
    await Pokemon.deleteMany();
    const total = 809;
    for(i = 1; i <= total; i++){
        const zerofield = ('00'+i).slice(-3);
        const property = properties[i-1];
        const pokemon = new Pokemon({            
            name: property.name.english,
            type: [...property.type],
            HP: property.base.HP,
            attack: property.base.Attack,
            defense: property.base.Defense,
            speed: property.base.Speed,
            image:{
                filename: `${zerofield}.png`,
                path: `/images/${zerofield}.png`,
            },
            author: "61fab7bb1848dea03e4cf338",
        });
        await pokemon.save();
    }
};

seedDB().then(()=>{
    mongoose.connection.close();
});
