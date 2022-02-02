const express= require('express');
const BasicJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const Pokemon = require('../models/pokemon.js');


//validate schema for Pokemon model
const extension = (joi) => ({

    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': 'Should not contain any html tags.',
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
  });

const Joi = BasicJoi.extend(extension);

module.exports.schemaPokemon = Joi.object({
    name: Joi.string().required().escapeHTML(),
    type: Joi.string().required().escapeHTML(),
    HP: Joi.number().required().min(0),
    attack: Joi.number().required().min(0),
    defense: Joi.number().required().min(0),
    speed: Joi.number().required().min(0),
    deleteImages: Joi.array(),
});


//authentication
module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.oriUrl = req.originalUrl;
        req.flash("error", "You must be signed in!");
        res.redirect("/users/login");
    }else {
        next();
    }
};

//authorization
module.exports.isAuthor = async (req, res, next) => {
    const {id} = req.params;
    const pokemon = await Pokemon.findById(id);
    if(!pokemon.author.equals(req.user._id)) {
        req.flash("error", "You do not have the permission to do this!");
        res.redirect(`/pokemons/${id}`);
    }else {
        next();
    }
};
