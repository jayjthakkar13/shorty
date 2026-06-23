import { Router } from "express";
import UrlController from "../controllers/url.controller";

const router = Router();

router.post('/api/url/shorten', UrlController.shorten);

router.delete('/api/url/delete', UrlController.delete);

router.get('/api/url/list', UrlController.getUrlList);

router.get('/:shortCode', UrlController.redirect);

export default router;