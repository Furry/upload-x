/*
Handles account customization
*/

import Router, { json, Express } from "express"

import { Mongo } from "../mongo/Mongo"
import * as errors from "./errors"
import * as crypto from "../utils/encrypt"
import * as snowflake from "../utils/snowflake"

// A factory function so we can pass the MongoDB class.
export default function (mongo: Mongo): Express {
    const router = Router()

    router.use(json())

    /**
     * Get account information, simple enough. Accessable via Bearer token
     */
    router.get("/", async (req, res) => {
        if (!req.headers.authorization?.startsWith("Token ")) {
            return res.status(errors.tokenFail.code).json(errors.tokenFail)
        }

        const token = req.headers.authorization.split(" ")[1]
        const result = await mongo.findOne({ token: token })

        if (!result) return res.status(errors.tokenFail.code).json(errors.tokenFail)

        res.status(200).json({
            code: 200,
            token: result.token,
            username: result.username,
            joinDate: result.joinDate,
            domains: result.domains
        })

    })

    /**
     * Update the domains associated with an account. Validation is done on the input object to insure it's..
     * 1.) An array
     * 2.) Only contains strings
     */
    router.post("/domains", async (req, res) => {
        if (!req.headers.authorization?.startsWith("Token ")) {
            return res.status(errors.tokenFail.code).json(errors.tokenFail)
        }

        const token = req.headers.authorization.split(" ")[1]

        const result = await mongo.findOne({ token: token })

        if (!result) return res.status(errors.tokenFail.code).json(errors.tokenFail)
        if (!req.body.domains ||
            !Array.isArray(req.body.domains) ||
            req.body.domains.map(item => typeof item == "string").includes(false)) { 

            return res.status(errors.bodyFail.code).json(errors.bodyFail)
        }

        const newData = { ...result, domains: req.body.domains}

        await mongo.updateOne({ token: token }, newData)

        return res.status(200).json({
            code: 200
        })
    })

    /**
     * The method for creating a new account via User & Password
     * 
     * This does validation against existing usernames, if they exist it throws an error.
     */
    router.post("/create", async (req, res) => {
        if (!req.body.username || !req.body.password) {
            return res.status(errors.loginFail.code).json(errors.loginFail)
        }

        const usernames = await mongo.findMany({ username: req.body.username })

        if (usernames.length > 0) {
            return res.status(errors.usernameTaken.code).json(errors.usernameTaken)
        }

        const stamp = Date.now()
        const token = snowflake.createToken(req.body.username)

        await mongo.insertOne({
            "token": token,
            "username": req.body.username,
            "password": crypto.generateHash(req.body.password, stamp.toString()),
            "joinDate": stamp,
            "key": crypto.aes.createKey(req.body.password),
            "domains": [
                "uploadx.naminginprogress.com"
            ]
        })

        return res.status(200).json({
            code: 200,
            message: token
        })
    })

    router.post("/token", async (req, res) => {
        if (!req.body.username || !req.body.password) {
            return res.status(errors.loginFail.code).json(errors.loginFail)
        }

        const users = await mongo.findMany({ username: req.body.username })

        if (users.length == 0) {
            return res.status(errors.noUsername.code).json(errors.noUsername)
        }

        const user = users[0]

        if (crypto.generateHash(req.body.password, user.joinDate) != user.password) {
            return res.status(errors.invalidPassword.code).json(errors.invalidPassword)
        }

        const token = snowflake.createToken(req.body.username)

        await mongo.updateOne({ username: req.body.username }, { token: token })

        return res.status(200).json({
            code: 200,
            message: token
        })

    })

    return router
}

