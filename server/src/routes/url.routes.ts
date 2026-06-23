import { Router } from "express";
import UrlController from "../controllers/url.controller";
import authenticate from "../middleware/authenticate";

const router = Router();

router.post('/url/shorten', authenticate, UrlController.shorten);

router.delete('/url/delete', authenticate, UrlController.delete);

router.get('/url/list', authenticate, UrlController.getUrlList);

router.get('/:shortCode', UrlController.redirect);

export default router;