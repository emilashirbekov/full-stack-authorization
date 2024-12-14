import express from "express";
import { register } from "../controllers/user-controller";

const router = express.Router();

router.post("/registration", register);
router.post("/login");
router.post("/logout");
router.get("/activate/link");
router.post("/refresh");
router.post("/users");

export default router;
