import express = require('express');
const router = express.Router();
import session = require('express-session');
const compression = require('compression');
const rateLimit = require("express-rate-limit");
import MongoDBSession = require('connect-mongodb-session');
const MongoDBStore = MongoDBSession(session);
import { Config } from '../config/types/Config';
import { DependencyContainer } from '../services/types/DependencyContainer';
import registerRoutes from './routes';
import {SingleRouter} from "./singleRoute";
import Middleware from "./middleware";

export default async (config: Config, app, container: DependencyContainer) => {
    app.use(require('body-parser').json({
        limit: '1000kb' // Note: This allows large custom galaxies to be uploaded.
    }));

    // ---------------
    // Set up MongoDB session store
    let sessionStorage = new MongoDBStore({
        uri: config.connectionString!,
        collection: 'sessions'
    });

    // Catch session store errors
    sessionStorage.on('error', function(err) {
        console.error(err);
    });

    // ---------------
    // Use sessions for tracking logins
    app.use(session({
        secret: config.sessionSecret!,
        resave: false,
        saveUninitialized: false,
        cookie: { 
            secure: config.sessionSecureCookies, // Requires HTTPS
            maxAge: 1000 * 60 * 60 * 24 * 365 // 1 Year
        },
        store: sessionStorage
    }));

    // ---------------
    // Enable CORS
    app.use((req, res, next) => {
        if (config.corsUrls.includes(req.headers.origin)) {
            res.header("Access-Control-Allow-Origin", req.headers.origin);
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Access-Control-Allow-Methods', 'POST, PUT, PATCH, GET, DELETE, OPTIONS');
        }

        return next();
    });

    // ---------------
    // Rate limiting
    app.set('trust proxy', 1); // NOTE: App is behind a proxy in production so this is required.
    
    const limiter = rateLimit({
        windowMs: 1000, // 1 second
        max: 10 // limit each IP to X requests per windowMs
    });
    
    //  apply to all requests
    app.use(limiter);

    // compress all responses
    app.use(compression({
        threshold: 0,
        filter: (req, res) => {
            if (req.headers['x-no-compression']) {
                // don't compress responses if this request header is present
                return false;
            }
        
            // fallback to standard compression
            return compression.filter(req, res);
        }
    }));

    // ---------------
    // Register routes

    const middleware = Middleware(container);
    const singleRouter = new SingleRouter(router);
    registerRoutes(singleRouter, container, middleware);

    app.use(router);

    app.use(middleware.core.handleError);

    console.log('Express intialized.');
    
    return {
        app,
        sessionStorage
    };
};
