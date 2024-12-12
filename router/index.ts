import express from "express";
import userController from "../controllers/user-controller";

const router = express.Router();

router.post("/registration", userController.register);
router.post("/login");
router.post("/logout");
router.get("/activate/link");
router.post("/refresh");
router.post("/users");

export default router;
