import express, { json } from "express"
import path from "path"

import { Mongo } from "./mongo/Mongo"
import account from "./routes/account"
import upload from "./routes/upload"
import * as crypto from "./utils/encrypt"
import * as fs from "fs/promises"

const server = express()

if (!process.argv[2]) {
    console.log("Please specify a MongoDB connection URI string.")
    process.exit()
}

const database = new Mongo({
    uri: process.argv[2]
})

database.connect().then(() => {
    const shorts = crypto.genshort()

    server.use("/api", upload(database, path.resolve("/files"), shorts))
    server.use("/account", account(database))

    server.param("id", (req, res, next, id) => {
        // @ts-ignore
        req.id = id
        next()
    })

    server.use((error, req, res, next) => {
        console.log(error)
        if (error) {
            res.status(500).send({
                code: 500,
                message: "Oopsy Woopsy! I've done a fucky wucky >~< Please verify you've passed valid JSON in the request body next time~"
            })
        }
    })

    server.get("/:id", async (req, res) => {
        // @ts-ignore
        const id = req.id.split(".")[0]
        const result = await database.findOne({name: id}, "files")
        if (!result) {
            return res.status(404).sendFile(path.resolve("./files/404.jpg"))
        }
        const owner = await database.findOne({username: result.user})
        const contents = await fs.readFile(path.resolve(`./files/${result.name}.${result.extension}.blob`))

        const iv = Buffer.from(id)
        const key = owner.key

        const decrypted = crypto.aes.decrypt(contents, key, iv)

        res.end(decrypted)

    })

    server.listen(80, async () => {
        console.log("Listening!")
    })
})
