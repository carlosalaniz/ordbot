import { Controller, Get, Post, Route, Tags } from "tsoa";
import { readFile } from 'fs'
@Tags("Server")
@Route("server")
export class ServerController extends Controller {
    @Get("/messages")
    async getMessages() {
        return await new Promise((r) => {
            readFile('messages.json', (err, data) => {
                r(JSON.parse(data.toString("utf-8")))
            })
        })
    }
}