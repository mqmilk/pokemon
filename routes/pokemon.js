const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({dest: './public/images'});
const fs = require('fs');
const Joi = require('joi');
const validator = require('express-joi-validation').createValidator({});


const catchAsync = require('../utilities/catchAsync.js');
const {schemaPokemon, isLoggedIn, isAuthor} = require('../utilities/validate.js');

//load models
const Pokemon = require('../models/pokemon.js');

router.get('/', catchAsync(async(req, res, next) => {
    const {type} = req.query;
    if(type){
        const pokemons = await Pokemon.find({type:type});
        res.render('pokemons/index.ejs', {pokemons, type});
    }
    const pokemons = await Pokemon.find({});
    res.render('pokemons/index.ejs', {pokemons, type:'All'});
}));

router.get('/guess', catchAsync(async (req, res, next) => {
    const count = await Pokemon.count();
    const rand = Math.floor(Math.random()*count);
    const pokemon = await Pokemon.findOne().skip(rand);
    res.render('pokemons/guess.ejs', {pokemon});
}));

router.get('/search', catchAsync(async (req, res, next) => {
    const search = req.query.Search;
    const pokemons = await Pokemon.find({name: {
        '$regex': search,
        '$options': 'i'
    }});
    res.render('pokemons/index.ejs', {pokemons, type:'Searched'});  
}));

router.get('/create', isLoggedIn, (req, res) => {
    res.render('pokemons/create.ejs');
});

router.post('/create', isLoggedIn, upload.array('image'), validator.body(schemaPokemon), catchAsync(async (req, res, next) => {
    if(req.body.name){
        const name = req.body.name;
        req.body.name = name[0].toUpperCase() + name.slice(1);
    }
    if(req.body.type){
        const arr = req.body.type.split(',');
        for(let i=0; i<arr.length; i++){
            arr[i] = arr[i].trim();
        }
        req.body.type = arr;
    }
    const pokemon = new Pokemon(req.body);
    pokemon.image = req.files.map(f => ({filename: f.filename,
        path: f.path}));
    pokemon.author = req.user._id;
    await pokemon.save();
    res.redirect(`/pokemons/${pokemon._id}`);
}));


router.get('/:id', catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const pokemon = await Pokemon.findById(id).populate('author');
    if(!pokemon) {
        return res.redirect('/');
    }
    res.render('pokemons/show.ejs', {pokemon});
}));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const pokemon = await Pokemon.findByIdAndDelete(id);
    const images = pokemon.image;
    if(images){
        for(let img of images){
            const path = `${img.path}`;
            fs.unlinkSync(path);
        }
    }
    res.redirect('/');
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async(req, res, next) => {
    const {id} = req.params;
    const pokemon = await Pokemon.findById(id);
    if(!pokemon) {
        return res.redirect('/');
    }
    res.render('pokemons/edit.ejs', {pokemon});
}));

router.put('/:id/edit', isLoggedIn, isAuthor, upload.array('image'), validator.body(schemaPokemon), catchAsync(async(req, res, next) => {
    const {id} = req.params;
    if(req.body.name){
        const name = req.body.name;
        req.body.name = name[0].toUpperCase() + name.slice(1);
    }
    if(req.body.type){
        const arr = req.body.type.split(',');
        for(let i=0; i<arr.length; i++){
            arr[i] = arr[i].trim();
        }
        req.body.type = arr;
    }
    const pokemon = await Pokemon.findByIdAndUpdate(id, req.body, {new:true});
    const img = req.files.map(f => ({filename: f.filename,
        path: f.path}));
    pokemon.image.push(...img);
    await pokemon.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            fs.unlinkSync(`public/images/${filename}`);
        }
        await pokemon.updateOne({$pull:{image:{filename:{$in:req.body.deleteImages}}}});
    }
    res.redirect(`/pokemons/${id}`);
}));


module.exports = router;