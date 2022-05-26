import { MongoClient, ServerApiVersion } from "mongodb";
import express from "express";

const uri =
  "mongodb://localhost:27017";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const databaseRouter = express.Router();

const findDb = async (dbName) => {
  let occurrence = 0;
  try {
    const availableDatabases = await client.db().admin().listDatabases();
    availableDatabases.databases.map((item, index) => {
      if (dbName === item.name) {
        occurrence = 1;
      }
    });
  } catch (err) {
    console.log(err);
  }
  if (occurrence === 1) {
    return true;
  } else {
    return false;
  }
};

const findCollection = async (database, collectionName) => {
  let occurrence = 0;
  try {
    const availableCollections = database.listCollections();
    await availableCollections.forEach((item) => {
      if (collectionName === item.name) {
        occurrence = 1;
      }
    });
  } catch (err) {
    console.log(err);
  }
  if (occurrence === 1) {
    return true;
  } else {
    return false;
  }
};

const getNumOfDocs = async (collection) => {
  return await collection.estimatedDocumentCount();
};

databaseRouter.get("/:dbname/:collection", async (req, res) => {
  try {
    await client.connect();
    if (await findDb(req.params.dbname)) {
      const database = client.db(req.params.dbname);
      if (await findCollection(database, req.params.collection)) {
        const collection = database.collection(req.params.collection);
        const numOfDocs = await getNumOfDocs(collection);
        if (numOfDocs > 0) {
          const collectionData = collection.find();
          res
            .status(200)
            .json(await collectionData.toArray())
            .end();
        } else {
          res
            .status(200)
            .json({
              message: `no data found inside '${req.params.collection}' collection`,
            })
            .end();
        }
      } else {
        res
          .status(404)
          .json({
            message: `'${req.params.collection}' collection not found in '${req.params.dbname}' database`,
          })
          .end();
      }
    } else {
      res
        .status(404)
        .json({
          message: `'${req.params.dbname}' database not found`,
        })
        .end();
    }
  } catch (error) {
    res.status(500).json({ message: error.message }).end();
  } finally {
    await client.close();
  }
});

databaseRouter.post("/additem/:dbname/:collection", async (req, res) => {
  try {
    await client.connect();
    if (await findDb(req.params.dbname)) {
      const database = client.db(req.params.dbname);
      if (await findCollection(database, req.params.collection)) {
        const collection = database.collection(req.params.collection);
        if (
          req.body._id === undefined ||
          req.body.name === undefined ||
          req.body.price === undefined ||
          req.body.stock === undefined
        ) {
          res
            .status(400)
            .json({
              message: "please check syntax and try again.",
            })
            .end();
        } else if (
          (typeof req.body.name === "string" && req.body.name.trim() === "") ||
          typeof req.body._id !== "number" ||
          typeof req.body.name !== "string" ||
          typeof req.body.price !== "number" ||
          typeof req.body.stock !== "number"
        ) {
          res
            .status(400)
            .json({
              message: "please check value of entered data and try again.",
            })
            .end();
        } else {
          const result = await collection.insertOne(req.body);
          if (result.acknowledged === true) {
            res
              .status(200)
              .json({
                message: `A document was inserted with the _id: ${result.insertedId}`,
              })
              .end();
          }
        }
      } else {
        res
          .status(404)
          .json({
            message: `'${req.params.collection}' collection not found in '${req.params.dbname}' database`,
          })
          .end();
      }
    } else {
      res
        .status(404)
        .json({
          message: `'${req.params.dbname}' database not found`,
        })
        .end();
    }
  } catch (error) {
    res.status(500).json({ message: error.message }).end();
  } finally {
    await client.close();
  }
});

databaseRouter.delete("/deleteitem/:dbname/:collection", async (req, res) => {
  try {
    await client.connect();
    if (await findDb(req.params.dbname)) {
      const database = client.db(req.params.dbname);
      if (await findCollection(database, req.params.collection)) {
        const collection = database.collection(req.params.collection);
        if (req.body._id === undefined) {
          res
            .status(400)
            .json({
              message: "please check syntax and try again.",
            })
            .end();
        } else if (typeof req.body._id === "string") {
          res
            .status(400)
            .json({
              message: "please check value of entered data and try again.",
            })
            .end();
        } else {
          const result = await collection.deleteOne(req.body);
          if (result.acknowledged === true && result.deletedCount > 0) {
            res
              .status(200)
              .json({
                message: `A document was deleted with the _id: ${req.body._id}`,
              })
              .end();
          } else {
            res
              .status(404)
              .json({
                message: `No document was found with the _id: ${req.body._id}`,
              })
              .end();
          }
        }
      } else {
        res
          .status(404)
          .json({
            message: `'${req.params.collection}' collection not found in '${req.params.dbname}' database`,
          })
          .end();
      }
    } else {
      res
        .status(404)
        .json({
          message: `'${req.params.dbname}' database not found`,
        })
        .end();
    }
  } catch (error) {
    res.status(500).json({ message: error.message }).end();
  } finally {
    await client.close();
  }
});

export default databaseRouter;
