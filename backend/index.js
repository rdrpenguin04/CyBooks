import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { MongoClient, ObjectId } from "mongodb";
import crypto from "crypto";
import { nanoid } from "nanoid";
import cookieParser from "cookie-parser";
import base64url from "base64url";

const app = express();

const dbUrl = "mongodb://127.0.0.1:27017";
const dbName = "cybooks";
const client = new MongoClient(dbUrl);
const db = client.db(dbName);

const users = db.collection("users");
const lessons = db.collection("lessons");
const completions = db.collection("completions");

{
    // Database setup
    await users.createIndex({ username: 1 }, { unique: true });
    await completions.createIndex({ user: 1, lesson: 1 }, { unique: true });
}

app.use(
    cors({
        credentials: true,
        origin: /localhost:3000/,
    })
);
app.use(bodyParser.json());
app.use(cookieParser());

const loggedInUsers = {}; // could've used Map, but an object may actually be *more* performant :)

// Hi, I'm Ray, and I know how to properly store passwords
app.post("/signup", async (req, res) => {
    try {
        console.log(`POST /signup, body = ${JSON.stringify(req.body)}`);
        await client.connect();

        let username = String(req.body.username);
        let password = String(req.body.password); // nothing gets by us :)
        // todo: validate characters. probably don't care too much though.

        if (!username || !password) {
            res.status(400).json({ error: "missing username and/or password" });
            return;
        }

        let accountType = String(req.body.accountType);
        if (accountType !== "student" && accountType !== "instructor") {
            res.status(400).json({ error: "invalid account type" });
            return;
        }

        let salt = nanoid();
        let passwordHash = crypto.createHash("sha512");
        passwordHash.update(password);
        passwordHash.update(salt);

        const newUser = {
            username,
            accountType,
            passwordHash: passwordHash.digest("base64url"),
            salt,
        };
        try {
            await users.insertOne(newUser);
            res.status(200).json({ username, accountType });
        } catch (error) {
            res.status(409).json({ error: "username taken" });
        }
    } catch (error) {
        console.log(`caught error in /signup: ${error}`);
        res.status(500).json({ error: "internal server error" });
    }
});

app.post("/login", async (req, res) => {
    try {
        console.log(`POST /login, body = ${JSON.stringify(req.body)}`);
        await client.connect();

        let username = String(req.body.username);
        let password = String(req.body.password);

        if (!username || !password) {
            res.status(400).json({ error: "missing username and/or password" });
            return;
        }

        let query = { username: username };
        let user = await users.findOne(query);

        if (!user) {
            res.status(403).json({ error: "incorrect username" });
            return;
        }

        let salt = user.salt;
        let passwordHash = crypto.createHash("sha512");
        passwordHash.update(password);
        passwordHash.update(salt);
        passwordHash = passwordHash.digest("base64url");

        if (passwordHash !== user.passwordHash) {
            res.status(403).json({ error: "incorrect password" });
            return;
        }

        let accountType = user.accountType;

        let session = nanoid();
        loggedInUsers[session] = { id: user._id, accountType };
        res.status(200)
            .cookie("cybooks-session", session)
            .json({ accountType });
    } catch (error) {
        console.log(`caught error in /login: ${error}`);
        res.status(500).json({ error: "internal server error" });
    }
});

app.post("/logout", async (req, res) => {
    try {
        console.log("POST /logout");
        if (loggedInUsers[req.cookies["cybooks-session"]]) {
            delete loggedInUsers[req.cookies["cybooks-session"]];
        }
        res.clearCookie("cybooks-session").json({ status: "successful" });
    } catch (error) {
        console.log(`caught error in /logout: ${error}`);
        res.status(500).json({ error: "internal server error" });
    }
});

app.get("/lessons", async (req, res) => {
    try {
        console.log("GET /lessons");
        let allLessons = await lessons.find({}).toArray();
        allLessons = allLessons.map((x) => {
            x.id = base64url.fromBase64(x._id.toString("base64"));
            delete x._id;
            x.author = base64url.fromBase64(x.author_id.toString("base64"));
            delete x.author_id;
            return x;
        });
        res.status(200).json(allLessons);
    } catch (error) {
        console.log(`caught error in GET /lessons: ${error}`);
        res.status(500).json({ error: "internal server error" });
    }
});

app.get("/lessons/:id", async (req, res) => {
    try {
        console.log(`GET /lessons/${req.params.id}`);
        let _id = ObjectId.createFromBase64(base64url.toBase64(req.params.id));

        let lesson = await lessons.findOne({ _id });
        lesson.id = base64url.fromBase64(lesson._id.toString("base64"));
        delete lesson._id;
        lesson.author = base64url.fromBase64(
            lesson.author_id.toString("base64")
        );
        delete lesson.author_id;

        res.status(200).json(lesson);
    } catch (error) {
        console.log(`caught error in GET /lessons/:id: ${error}`);
        res.status(500).json({ error: "internal server error" });
    }
});

app.post("/lessons", async (req, res) => {
    try {
        console.log("POST /lessons");

        let liveSession = loggedInUsers[req.cookies["cybooks-session"]];
        if (liveSession.accountType !== "instructor") {
            res.status(403).json({ error: "insufficient permission" });
            return;
        }
        req.body.author_id = liveSession.id;

        let result = await lessons.insertOne(req.body);
        let id = base64url.fromBase64(result.insertedId.toString("base64"));

        console.log(`new id: ${id}`);
        res.status(201)
            .location(`/lessons/${id}`)
            .json({ id, title: req.body.title });
    } catch (error) {
        console.log(`caught error in POST /lessons: ${error}`);
        res.status(500).json({ error: "internal server error" });
    }
});

app.put("/lessons/:id", async (req, res) => {
    try {
        console.log(`PUT /lessons/${req.params.id}`);
        let _id = ObjectId.createFromBase64(base64url.toBase64(req.params.id));

        let lesson = await lessons.findOne({ _id });

        let liveSession = loggedInUsers[req.cookies["cybooks-session"]];
        if (liveSession.id != lesson.author_id) {
            res.status(403).json({ error: "insufficient permission" });
            return;
        }

        let updateData = { $set: {} };
        if (req.body.title) updateData.$set.title = String(req.body.title);
        if (req.body.cards) updateData.$set.cards = req.body.cards;

        // this is kinda half PUT and half PATCH
        await lessons.updateOne({ _id }, updateData);
        res.status(204).send();
    } catch (error) {
        console.log(`caught error in PUT /lessons/:id: ${error}`);
        res.status(500).json({ error: "internal server error" });
    }
});

app.delete("/lessons/:id", async (req, res) => {
    try {
        console.log(`DELETE /lessons/${req.params.id}`);
        let _id = ObjectId.createFromBase64(base64url.toBase64(req.params.id));

        let lesson = await lessons.findOne({ _id });

        let liveSession = loggedInUsers[req.cookies["cybooks-session"]];
        if (liveSession.id != lesson.author_id) {
            res.status(403).json({ error: "insufficient permission" });
            return;
        }

        await lessons.deleteOne({ _id });
        res.status(204).send();
    } catch (error) {
        console.log(`caught error in DELETE /lessons/:id: ${error}`);
        res.status(500).json({ error: "internal server error" });
    }
});

app.get("/instructors/:id/lessons/:lesson", async (req, res) => {
    try {
        console.log(
            `GET /instructors/${req.params.id}/lessons/${req.params.lesson}`
        );

        let _id = ObjectId.createFromBase64(
            base64url.toBase64(req.params.lesson)
        );

        let lesson = await lessons.findOne({ _id });
        lesson.id = base64url.fromBase64(x._id.toString("base64"));
        delete lesson._id;
        lesson.author = base64url.fromBase64(x.author_id.toString("base64"));
        delete lesson.author_id;

        res.status(200).json(lesson);
    } catch (error) {
        console.log(
            `caught error in GET /instructors/:id/lessons/:lesson: ${error}`
        );
        res.status(500).json({ error: "internal server error" });
    }
});

app.get("/students/:id", async (req, res) => {
    try {
        console.log(`GET /students/${req.params.id}`);

        let _id = req.params.id;

        if (_id === "me") {
            let liveSession = loggedInUsers[req.cookies["cybooks-session"]];
            if (liveSession.accountType !== "student") {
                res.status(400).json({ error: "not a student" });
                return;
            }
            _id = liveSession.id;
        } else {
            _id = ObjectId.createFromBase64(base64url.toBase64(_id));
        }

        let user = await users.findOne({ _id });

        res.status(200).json({ username: user.username });
    } catch (error) {
        console.log(`caught error in GET /students/:id: ${error}`);
        res.status(500).json({ error: "internal server error" });
    }
});

app.get("/students/:id/completions", async (req, res) => {
    try {
        console.log(`GET /students/${req.params.id}/completions`);

        let user = req.params.id;

        if (user === "me") {
            let liveSession = loggedInUsers[req.cookies["cybooks-session"]];
            if (liveSession.accountType !== "student") {
                res.status(400).json({ error: "not a student" });
                return;
            }
            user = liveSession.id;
        } else {
            user = ObjectId.createFromBase64(base64url.toBase64(user));
        }

        let completionsForStudent = await completions.find({ user }).toArray();
        completionsForStudent = completionsForStudent.map((x) => {
            delete x._id;
            delete x.user;
            x.lesson = base64url.fromBase64(x.lesson.toString("base64"));
            return x;
        });
        res.status(200).json(completionsForStudent);
    } catch (error) {
        console.log(`caught error in GET /students/:id/completions: ${error}`);
        res.status(500).json({ error: "internal server error" });
    }
});

app.get("/students/:id/completions/:lesson", async (req, res) => {
    try {
        console.log(
            `GET /students/${req.params.id}/completions/${req.params.lesson}`
        );

        let user = req.params.id;

        if (user === "me") {
            let liveSession = loggedInUsers[req.cookies["cybooks-session"]];
            if (liveSession.accountType !== "student") {
                res.status(400).json({ error: "not a student" });
                return;
            }
            user = liveSession.id;
        } else {
            user = ObjectId.createFromBase64(base64url.toBase64(user));
        }

        let completion = await completions.findOne({
            user,
            lesson: ObjectId.createFromBase64(
                base64url.toBase64(req.params.lesson)
            ),
        });
        delete completion._id;
        delete completion.user;
        delete completion.lesson;
        res.status(200).json(completion);
    } catch (error) {
        console.log(
            `caught error in GET /students/:id/completions/:lesson: ${error}`
        );
        res.status(500).json({ error: "internal server error" });
    }
});

app.put("/students/:id/completions/:lesson", async (req, res) => {
    try {
        console.log(
            `PUT /students/${req.params.id}/completions/${req.params.lesson}`
        );

        let user = req.params.id;

        if (user === "me") {
            let liveSession = loggedInUsers[req.cookies["cybooks-session"]];
            if (liveSession.accountType !== "student") {
                res.status(400).json({ error: "not an student" });
                return;
            }
            user = liveSession.id;
        } else {
            user = ObjectId.createFromBase64(base64url.toBase64(user));
        }

        let updateData = {
            $set: {
                progress: req.body.progress,
                checkpoints: req.body.checkpoints,
            },
        };

        let result = await completions.updateOne(
            {
                user,
                lesson: ObjectId.createFromBase64(
                    base64url.toBase64(req.params.lesson)
                ),
            },
            updateData,
            { upsert: true }
        );
        if (result.upsertedId) res.status(201).send();
        else res.status(204).send();
    } catch (error) {
        console.log(
            `caught error in GET /students/:id/completions/:lesson: ${error}`
        );
        res.status(500).json({ error: "internal server error" });
    }
});

app.get("/instructors/:id/completions", async (req, res) => {
    try {
        console.log(`GET /instructors/${req.params.id}/completions`);

        let user = req.params.id;

        if (user === "me") {
            let liveSession = loggedInUsers[req.cookies["cybooks-session"]];
            if (liveSession.accountType !== "instructor") {
                res.status(400).json({ error: "not a instructor" });
                return;
            }
            user = liveSession.id;
        } else {
            user = ObjectId.createFromBase64(base64url.toBase64(user));
        }

        let completionsForStudent = await completions.find({ user }).toArray();
        completionsForStudent = completionsForStudent.map((x) => {
            delete x._id;
            delete x.user;
            x.lesson = base64url.fromBase64(x.lesson.toString("base64"));
            return x;
        });
        res.status(200).json(completionsForStudent);
    } catch (error) {
        console.log(
            `caught error in GET /instructors/:id/completions: ${error}`
        );
        res.status(500).json({ error: "internal server error" });
    }
});

// Note to future self: this is literally the exact same as /students/:id/completions. Maybe make it the same next time :)
app.get("/instructors/:id/completions/:lesson", async (req, res) => {
    try {
        console.log(
            `GET /instructors/${req.params.id}/completions/${req.params.lesson}`
        );

        let user = req.params.id;

        if (user === "me") {
            let liveSession = loggedInUsers[req.cookies["cybooks-session"]];
            if (liveSession.accountType !== "instructor") {
                res.status(400).json({ error: "not an instructor" });
                return;
            }
            user = liveSession.id;
        } else {
            user = ObjectId.createFromBase64(base64url.toBase64(user));
        }

        let completion = await completions.findOne({
            user,
            lesson: ObjectId.createFromBase64(
                base64url.toBase64(req.params.lesson)
            ),
        });
        completionsForStudent = completionsForStudent.map((x) => {
            delete x._id;
            delete x.user;
            delete x.lesson;
            return x;
        });
        res.status(200).json(completion);
    } catch (error) {
        console.log(
            `caught error in GET /instructors/:id/completions: ${error}`
        );
        res.status(500).json({ error: "internal server error" });
    }
});

app.put("/instructors/:id/completions/:lesson", async (req, res) => {
    try {
        console.log(
            `PUT /instructors/${req.params.id}/completions/${req.params.lesson}`
        );

        let user = req.params.id;

        if (user === "me") {
            let liveSession = loggedInUsers[req.cookies["cybooks-session"]];
            if (liveSession.accountType !== "instructor") {
                res.status(400).json({ error: "not an instructor" });
                return;
            }
            user = liveSession.id;
        } else {
            user = ObjectId.createFromBase64(base64url.toBase64(user));
        }

        let updateData = {
            $set: {
                progress: req.body.progress,
                checkpoints: req.body.checkpoints,
            },
        };

        let result = await completions.updateOne(
            {
                user,
                lesson: ObjectId.createFromBase64(
                    base64url.toBase64(req.params.lesson)
                ),
            },
            updateData,
            { upsert: true }
        );
        if (result.upsertedId) res.status(201).send();
        else res.status(204).send();
    } catch (error) {
        console.log(
            `caught error in PUT /instructors/:id/completions/:lesson: ${error}`
        );
        res.status(500).json({ error: "internal server error" });
    }
});

app.get("/instructors/:id/lessons", async (req, res) => {
    try {
        console.log(`GET /instructors/${req.params.id}/lessons`);

        let user = req.params.id;

        if (user === "me") {
            let liveSession = loggedInUsers[req.cookies["cybooks-session"]];
            if (liveSession.accountType !== "instructor") {
                res.status(400).json({ error: "not an instructor" });
                return;
            }
            user = liveSession.id;
        } else {
            user = ObjectId.createFromBase64(base64url.toBase64(user));
        }

        let allLessons = await lessons.find({ author_id: user }).toArray();
        allLessons = allLessons.map((x) => {
            x.id = base64url.fromBase64(x._id.toString("base64"));
            delete x._id;
            x.author = base64url.fromBase64(x.author_id.toString("base64"));
            delete x.author_id;
            return x;
        });
        res.status(200).json(allLessons);
    } catch (error) {
        console.log(`caught error in GET /instructors/:id/lessons: ${error}`);
        res.status(500).json({ error: "internal server error" });
    }
});

app.get("/instructors/:id/lessons/:lesson/completions", async (req, res) => {
    try {
        console.log(
            `GET /instructors/${req.params.id}/lessons/${req.params.lesson}/completions`
        );

        let user = req.params.id;

        if (user === "me") {
            let liveSession = loggedInUsers[req.cookies["cybooks-session"]];
            if (liveSession.accountType !== "instructor") {
                res.status(400).json({ error: "not an instructor" });
                return;
            }
            user = liveSession.id;
        } else {
            user = ObjectId.createFromBase64(base64url.toBase64(user));
        }

        let lesson_id = ObjectId.createFromBase64(
            base64url.toBase64(req.params.lesson)
        );

        let lesson = lessons.find({ _id: lesson_id });

        if (lesson.author != user) {
            res.status(403).json({ error: "insufficient permissions" });
        }

        let completionsForLesson = await lessons
            .find({ lesson: lesson_id })
            .toArray();
        completionsForLesson = completionsForLesson.map((x) => {
            delete x._id;
            x.user = base64url.fromBase64(x.user.toString("base64"));
            delete x.lesson;
            return x;
        });
        res.status(200).json(completionsForLesson);
    } catch (error) {
        console.log(
            `caught error in GET /instructors/:id/lessons/:lesson/completions: ${error}`
        );
        res.status(500).json({ error: "internal server error" });
    }
});

let listener = app.listen(8081, () => {
    console.log(`Listening on port ${listener.address().port}`);
});
