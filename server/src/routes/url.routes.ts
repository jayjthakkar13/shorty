import { Router } from "express";
import UrlController from "../controllers/url.controller";

const router = Router();

router.post('/shorten', UrlController.shorten);

router.delete('/delete', UrlController.delete);

router.get('/list', UrlController.getUrlList);

router.get('/:shortCode', UrlController.redirect);

export default router;