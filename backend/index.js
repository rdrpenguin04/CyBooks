import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { MongoClient, ObjectId } from 'mongodb';
import crypto from 'crypto';
import { nanoid } from 'nanoid';
import cookieParser from 'cookie-parser';
import base64url from 'base64url';

const app = express();

const dbUrl = 'mongodb://127.0.0.1:27017';
const dbName = 'cybooks';
const client = new MongoClient(dbUrl);
const db = client.db(dbName);

const users = db.collection('users');
const lessons = db.collection('lessons');

{
    // Database setup
    await users.createIndex({ 'username': 1 }, { unique: true });
    await lessons.createIndex({ 'title': 1 });
}

app.use(cors({
    credentials: true,
    origin: /localhost:3000/,
}));
app.use(bodyParser.json());
app.use(cookieParser());

const loggedInUsers = {}; // could've used Map, but an object may actually be *more* performant :)

// user structure: { username: String, accountType: String, passwordHash: String, salt: String }
// Hi, I'm Ray, and I know how to properly store passwords

app.post('/signup', async (req, res) => {
    try {
        console.log(`POST /signup, body = ${JSON.stringify(req.body)}`);
        await client.connect();

        let username = String(req.body.username);
        let password = String(req.body.password); // nothing gets by us :)
        // todo: validate characters. probably don't care too much though.

        if (!username || !password) {
            res.status(400).json({ error: 'missing username and/or password' });
            return;
        }

        let accountType = String(req.body.accountType);
        if (accountType !== 'student' && accountType !== 'instructor') {
            res.status(400).json({ error: 'invalid account type' });
            return;
        }

        let salt = nanoid();
        let passwordHash = crypto.createHash('sha512');
        passwordHash.update(password);
        passwordHash.update(salt);

        const newUser = { username, accountType, passwordHash: passwordHash.digest('base64url'), salt };
        try {
            await users.insertOne(newUser);
            res.status(200).json({ username, accountType });
        } catch (error) {
            res.status(409).json({ error: 'username taken' });
        }
    } catch (error) {
        console.log(`caught error in /signup: ${error}`);
        res.status(500).json({ error: 'internal server error' });
    }
});

app.post('/login', async (req, res) => {
    try {
        console.log(`POST /login, body = ${JSON.stringify(req.body)}`);
        await client.connect();

        let username = String(req.body.username);
        let password = String(req.body.password);

        if (!username || !password) {
            res.status(400).json({ error: 'missing username and/or password' });
            return;
        }

        let query = { 'username': username };
        let user = await users.findOne(query);

        if (!user) {
            res.status(403).json({ error: 'incorrect username' });
            return;
        }

        let salt = user.salt;
        let passwordHash = crypto.createHash('sha512');
        passwordHash.update(password);
        passwordHash.update(salt);
        passwordHash = passwordHash.digest('base64url');

        if (passwordHash !== user.passwordHash) {
            res.status(403).json({ error: 'incorrect password' });
            return;
        }

        let accountType = user.accountType;

        let session = nanoid();
        loggedInUsers[session] = { username, accountType };
        res.status(200).cookie('cybooks-session', session).json({ accountType });
    } catch (error) {
        console.log(`caught error in /login: ${error}`);
        res.status(500).json({ error: 'internal server error' });
    }
});

app.post('/logout', async (req, res) => {
    try {
        console.log('POST /logout');
        if (loggedInUsers[req.cookies['cybooks-session']]) {
            delete loggedInUsers[req.cookies['cybooks-session']];
        }
        res.clearCookie('cybooks-session').json({ status: 'successful' });
    } catch (error) {
        console.log(`caught error in /logout: ${error}`);
        res.status(500).json({ error: 'internal server error' });
    }
});

app.get('/lessons', async (req, res) => {
    try {
        console.log('GET /lessons');
        let allLessons = await lessons.find({}).toArray();
        res.status(200).json(allLessons);
    } catch (error) {
        console.log(`caught error in GET /lessons: ${error}`);
        res.status(500).json({ error: 'internal server error' });
    }
});

app.get('/lessons/:id', async (req, res) => {
    try {
        console.log(`GET /lessons/${req.params.id}`);
        let _id = ObjectId.createFromBase64(base64url.toBase64(req.params.id));
        let lesson = await lessons.findOne({ _id });
        res.status(200).json(lesson);
    } catch (error) {
        console.log(`caught error in GET /lessons/:id: ${error}`);
        res.status(500).json({ error: 'internal server error' });
    }
});

app.post('/lessons', async (req, res) => {
    try {
        console.log('POST /lessons');
        let result = await lessons.insertOne(req.body);
        let id = base64url.fromBase64(result.insertedId.toString('base64'));
        console.log(`new id: ${id}`);
        res.status(201).location(`/lessons/${id}`).json({ id, title: req.body.title });
    } catch (error) {
        console.log(`caught error in POST /lessons: ${error}`);
        res.status(500).json({ error: 'internal server error' });
    }
});

app.put('/lessons/:id', async (req, res) => {
    try {
        console.log(`PUT /lessons/${req.params.id}`);
        let _id = ObjectId.createFromBase64(base64url.toBase64(req.params.id));
        let updateData = { $set: {} };
        if (req.body.title)
            updateData.$set.title = String(req.body.title);
        if (req.body.cards)
            updateData.$set.cards = req.body.cards;
        // this is kinda half PUT and half PATCH
        await lessons.updateOne({ _id }, updateData);
        res.status(204).send();
    } catch (error) {
        console.log(`caught error in PUT /lessons/:id: ${error}`);
        res.status(500).json({ error: 'internal server error' });
    }
});

app.delete('/lessons/:id', async (req, res) => {
    try {
        console.log(`DELETE /lessons/${req.params.id}`);
        let _id = ObjectId.createFromBase64(base64url.toBase64(req.params.id));
        if (loggedInUsers[req.cookies['cybooks-session']].accountType != 'instructor') {
            res.status(403).json({ error: 'insufficient permission' });
            return;
        }
        await lessons.deleteOne({ _id });
        res.status(204).send();
    } catch (error) {
        console.log(`caught error in DELETE /lessons/:id: ${error}`);
        res.status(500).json({ error: 'internal server error' });
    }
});

let listener = app.listen(8081, () => {
    console.log(`Listening on port ${listener.address().port}`)
});