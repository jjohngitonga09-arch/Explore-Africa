import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import otpRouter from "./otp";
import countriesRouter from "./countries";
import toursRouter from "./tours";
import bookingsRouter from "./bookings";
import visaRouter from "./visa";
import adminRouter from "./admin";
import galleryRouter from "./gallery";
import sponsorshipsRouter from "./sponsorships";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(otpRouter);
router.use(authRouter);
router.use(countriesRouter);
router.use(toursRouter);
router.use(bookingsRouter);
router.use(visaRouter);
router.use(adminRouter);
router.use(galleryRouter);
router.use(sponsorshipsRouter);
router.use(settingsRouter);

export default router;
