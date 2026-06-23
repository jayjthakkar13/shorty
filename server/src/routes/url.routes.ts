import { Router } from "express";
import UrlController from "../controllers/url.controller";
import authenticate from "../middleware/authenticate";

const router = Router();

router.post('/shorten', authenticate, UrlController.shorten);

router.delete('/delete', authenticate, UrlController.delete);

router.get('/list', authenticate, UrlController.getUrlList);

router.get('/:shortCode', UrlController.redirect);

export default router;