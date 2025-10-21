import { MongoClient, ObjectId } from "mongodb";
import express from "express";
import { nanoid } from "nanoid";
import bodyParser from "body-parser";
import z from "zod/v4";

const hostname = "localhost";
const port = 3000;

const app = express();
app.use(bodyParser.json());

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
const dbName = "URLShorteningService";
await client.connect();
const db = client.db(dbName);

type Schema = {
  url: string;
  shortCode: string;
  createdAt: string;
  updatedAt: string;
  accessCount: number;
};
const collection = db.collection<Schema>("documents");

app.get("/shorten/:shortCode", async (req, res) => {
  const document = await collection.findOne({
    shortCode: req.params.shortCode,
  });
  if (document) {
    res.send({
      id: document._id,
      url: document["url"],
      shortCode: document["shortCode"],
      createdAt: document["createdAt"],
      updatedAt: document["updatedAt"],
    });
  } else {
    res.sendStatus(404);
  }
});

app.get("/shorten/:shortCode/stats", async (req, res) => {
  const document = await collection.findOne({
    shortCode: req.params.shortCode,
  });
  if (document) {
    res.send({
      id: document._id,
      url: document["url"],
      shortCode: document["shortCode"],
      createdAt: document["createdAt"],
      updatedAt: document["updatedAt"],
      accessCount: document["accessCount"],
    });
  } else {
    res.sendStatus(404);
  }
});

app.post("/shorten", async (req, res) => {
  const url = req.body.url;
  if (z.httpUrl().safeParse(url).success === false) {
    res.sendStatus(400);
  }

  const shortCode = nanoid(7);
  const createdAt = new Date().toISOString();
  const _id = new ObjectId();
  await collection.insertOne({
    _id,
    url,
    shortCode,
    createdAt,
    updatedAt: createdAt,
    accessCount: 0,
  });
  res.status(201);
  res.send({
    id: _id,
    url,
    shortCode,
    createdAt,
    updatedAt: createdAt,
  });
});

app.put("/shorten/:shortCode", async (req, res) => {
  const shortCode = req.params.shortCode;
  const url = req.body.url;
  if (z.httpUrl().safeParse(url).success === false) {
    res.sendStatus(400);
  }

  const updatedAt = new Date().toISOString();
  const document = await collection.findOneAndUpdate(
    {
      shortCode,
    },
    {
      $set: {
        url,
        updatedAt,
      },
    }
  );
  if (document) {
    res.status(201);
    res.send({
      id: document._id,
      url,
      shortCode: document.shortCode,
      createdAt: document.createdAt,
      updatedAt,
    });
  } else {
    res.sendStatus(404);
  }
});

app.delete("/shorten/:shortCode", async (req, res) => {
  const shortCode = req.params.shortCode;

  await collection.deleteOne({
    shortCode,
  });
  res.sendStatus(204);
});

app.get("/:shortCode", async (req, res) => {
  const shortCode = req.params.shortCode;

  const document = await collection.findOne({
    shortCode,
  });
  if (document) {
    await collection.updateOne(
      {
        shortCode,
      },
      {
        $inc: {
          accessCount: 1,
        },
      }
    );
    res.redirect(document.url);
  } else {
    res.sendStatus(404);
  }
});

app.listen(port, hostname, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(
      `URL Shortening Service is running on http://${hostname}:${port}`
    );
  }
});
