import express from "express";
import { factory } from "../util/debug.js";
import TeenyUrlDao from "../data/TeenyUrlDao.js";

const debug = factory(import.meta.url);
const router = express.Router();
export const teenyUrlDao = new TeenyUrlDao();
const endpoint = "/urls";

router.get(`${endpoint}`, async (req, res, next) => {
    res.json({
        status: 405,
        message: `Method Not Allowed`
    });
});

router.get(`${endpoint}/:id`, async (req, res, next) => {
    try {
        const { id } = req.params;
        const shortUrl = await teenyUrlDao.read(id);
        res.json({
            status: 200,
            message: "Successfully retrieved the following teeny-url!",
            data: {
                "id": shortUrl.id,
                "long": shortUrl.url,
                "key": shortUrl.key,
                "short": `http://localhost:3000/${shortUrl.key}`
            }
        });
        debug(`Done with ${req.method} ${req.path}`);
    } catch (err) {
        debug(`There was an error processing ${req.method} ${req.path} `);
        next(err);
    }
});

router.post(`${endpoint}`, async (req, res, next) => {
    try {
        const { url } = req.body;
        const shortUrls = await teenyUrlDao.readAll({url});
        let shortUrl = shortUrls[0];
        if (shortUrl && url != "") {
            res.status(200).json({
                status: 400,
                message: `This URL is already mapped`,
                data: {
                    "long": url,
                    "key": shortUrl.key,
                    "short": `http://localhost:3000/${shortUrl.key}`
                }
            });
            return;
        }
        shortUrl = await teenyUrlDao.create(url);
        debug(`Preparing the response payload...`);
        res.json({
            status: 201,
            message: `Successfully created the following teeny-url!`,
            data: {
                "id": shortUrl.id,
                "long": url,
                "key": shortUrl.key,
                "short": `http://localhost:3000/${shortUrl.key}`
            }
        });
        debug(`Done with ${req.method} ${req.path}`);
    } catch (err) {
        debug(`There was an error processing ${req.method} ${req.path} `);
        next(err);
    }
});

router.put(`${endpoint}/:id`, async (req, res, next) => {
    try {
        await teenyUrlDao.update();
    } catch (err) {
        res.status(405).json({
            status: 405,
            message: `Method Not Allowed`
        });
    }
});

router.delete(`${endpoint}/:id`, async (req, res, next) => {
    try {
        const { id } = req.params;
        const shortUrl = await teenyUrlDao.delete(id);
        res.json({
            status: 200,
            message: "Successfully deleted the following teeny-url!",
            data: {
                "id": shortUrl.id,
                "long": shortUrl.url,
                "key": shortUrl.key,
                "short": `http://localhost:3000/${shortUrl.key}`
            }
        });
        debug(`Done with ${req.method} ${req.path}`);
    } catch (err) {
        debug(`There was an error processing ${req.method} ${req.path} `);
        next(err);
    }
});

router.get("/:key", async (req, res, next) => {
    try {
        const { key } = req.params;
        const shortUrls = await teenyUrlDao.readAll({key});
        const shortUrl = shortUrls[0];
        if (key) {
            return res.status(302).redirect(shortUrl.url);
        }
    } catch (err) {
        res.status(405);
        res.sendFile('/Users/harleytran/Desktop/Fall 2022/Javascript/hw8-teenyurl-api-nharleytran/assets/404.html');
    }
});

export default router;
