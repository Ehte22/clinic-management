import express from "express"
import * as userController from "../controllers/user.controller"
import multerMiddleware from "../utils/upload"
import { protectedRoute, restrict } from "../utils/protected"
import { cacheMiddleware } from "../utils/redisMiddleware"

const upload = multerMiddleware()

const userRouter = express.Router()

userRouter
    .get("/", protectedRoute, restrict(["Super Admin"]), cacheMiddleware, userController.getAllUsers)
    .get("/:id", protectedRoute, cacheMiddleware, userController.getUserById)
    .post("/add-user", protectedRoute, restrict(["Super Admin"]), upload.single("profile"), userController.createUser)
    .put("/update-user/:id", protectedRoute, upload.single("profile"), userController.updateUser)
    .put("/update-status/:id", protectedRoute, restrict(["Super Admin"]), userController.updateUserStatus)
    .put("/delete-user/:id", protectedRoute, restrict(["Super Admin"]), userController.deleteUser)
    .post("/register-user", upload.single("profile"), userController.registerUser)

export default userRouter