import {
    MongoClient,
    Collection,
    MongoError,
    Db
} from "mongodb"

interface ConnectionConfig {
    db?: string
    collection?: string
    uri: string
}

interface MongoSearch { [key: string]: string }
interface QueryResult { [key: string]: any }

export class Mongo {
    config: ConnectionConfig
    _database: any | null = null
    _client: MongoClient | null = null

    constructor(config: ConnectionConfig) {
        this.config = {
            db: "upload-x",
            collection: "accounts",
            ...config
        }
    }

    get db(): Db {
        if (!this._database) {
            throw "Database not connected"
        } else {
            return this._database
        }
    }

    get client(): MongoClient {
        if (!this._client) {
            throw "Client not connected"
        } else {
            return this._client
        }
    }

    get collection(): string {
        if (!this._client || !this._database) {
            throw "Not yet connected"
        } else {
            return this.config.collection as string
        }
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            MongoClient.connect(this.config.uri, { useUnifiedTopology: true, useNewUrlParser: true }, (err, client) => {
                if (err) return reject()
                this._client = client
                this._database = client.db(this.config.db)
                resolve()
            })
        })
    }

    findOne(query: MongoSearch, collection = this.collection): Promise<QueryResult> {
        return new Promise((resolve, reject) => {
            this.db.collection(collection).findOne(query, (err, res) => {
                if (err) reject(err)
                else return resolve(res)
            })
        })
    }

    findMany(query: MongoSearch, collection = this.collection): Promise<Array<QueryResult>> {
        return new Promise((resolve, reject) => {
            this.db.collection(collection).find(query).toArray((err, res) => {
                if (err) reject(err)
                return resolve(res)
            })
        })
    }

    updateOne(query: MongoSearch, newData: { [key: string]: any }, collection = this.collection): Promise<QueryResult> {
        return new Promise((resolve, reject) => {
            this.db.collection(collection).updateOne(query, { $set: newData }, (err, res) => {
                if (err) reject (err)
                else return resolve(res)
            })
        })
    }

    deleteOne(query: MongoSearch, collection = this.collection): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            this.db.collection(collection).deleteMany(query, (err, res) => {
                if (err) reject(false)
                else return resolve(true)
            })
        })
    }

    insertOne(newData: { [key: string]: any }, collection = this.collection): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            this.db.collection(collection).insertOne(newData, (err, res) => {
                if (err) reject(false)
                else return resolve(true)
            })
        })
    }
}

export interface Account {
    username: string
}