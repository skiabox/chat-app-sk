import express from "express";
import { signup, login, logout } from "../controllers/auth.controller.js";

const router = express.Router();

//routes, rest methods and controllers for every specific route
router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

export default router;
