import express, { Application } from "express";
import http from "http";
import { Server } from "socket.io"

const app: Application = express()

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*"
    }
})

io.on("connection", (socket) => {
    socket.on("disconnect", () => { })
})

export { app, server, io }