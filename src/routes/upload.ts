import Router, { json, Express, raw } from "express"

import { Mongo } from "../mongo/Mongo"
import * as errors from "./errors"
import * as crypto from "../utils/encrypt"
import * as utils from "../utils/util"
import * as bodyParser from "body-parser"
import * as fs from "fs/promises"
import * as path from "path"

export default function(mongo: Mongo, directory: string, codec: crypto.EncodingSchema) {
    const router = Router()

    router.use(bodyParser.raw({
        limit: "5mb",
        type: "*/*"
    }))

    router.post("/upload", async (req, res) => {
        if (!req.headers.authorization?.startsWith("Token ")) {
            return res.status(errors.tokenFail.code).json(errors.tokenFail)
        } else if (!req.query.extension) {
            return res.status(errors.extensionFail.code).json(errors.extensionFail)
        }

        if (req.query.extension != "png") req.query.extension = "txt"

        const token = req.headers.authorization.split(" ")[1]
        const imageCreationDate = Date.now()
        const name = utils.chunk(utils.padTo(imageCreationDate.toString(), 15), 5)
            .map(x => codec.encode[x])
            .join("")

        const result = await mongo.findOne({ token: token })

        if (!result) return res.status(errors.tokenFail.code).json(errors.tokenFail)

        const iv = Buffer.from(name)
        const encrypted = crypto.aes.encrypt(req.body, result.key, iv)

        try {
            await fs.writeFile(`${path.resolve(`./files/${name}.${req.query.extension}.blob`)}`, encrypted, "utf8")
            await mongo.insertOne({
                user: result.username,
                name: name,
                extension: req.query.extension,
                createDate: imageCreationDate
            }, "files")

        } catch (err) {
            console.log(err)
        }

        res.send({url: `http://${utils.choice(result.domains)}/${name}.${req.query.extension}`})

    })

    return router
}