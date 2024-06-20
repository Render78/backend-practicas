import passport from "passport";
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as GitHubStrategy } from 'passport-github2';
import userModel from '../dao/models/user.model.js';
import { createHash } from "../utils.js";
import dotenv from 'dotenv';
dotenv.config();

passport.use('register', new LocalStrategy(
    { passReqToCallback: true, usernameField: 'email' },
    async (req, email, password, done) => {
        const { first_name, last_name, age } = req.body;
        try {
            let user = await userModel.findOne({ email });
            if (user) {
                console.log("El usuario ya existe");
                return done(null, false);
            }
            const newUser = new userModel({
                first_name,
                last_name,
                email,
                age,
                password: createHash(password)
            });
            let result = await newUser.save();
            return done(null, result);
        } catch (error) {
            return done(error);
        }
    }
));

passport.use('login', new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
        try {
            const user = await userModel.findOne({ email });
            if (!user) {
                console.log("El usuario no existe");
                return done(null, false);
            }
            if (!user.comparePassword(password)) {
                console.log("Contraseña incorrecta");
                return done(null, false);
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

passport.use('github', new GitHubStrategy(
    {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await userModel.findOne({ email: profile._json.email });
            if (!user) {
                const newUser = new userModel({
                    first_name: profile._json.name,
                    email: profile._json.email,
                    age: 20,
                    password: ""
                });
                user = await newUser.save();
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});