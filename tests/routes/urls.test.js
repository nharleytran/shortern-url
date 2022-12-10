import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import { teenyUrlDao } from "../../src/routes/urls.js";
import app from "../../src/index.js";
import * as dotenv from "dotenv";
import * as db from "../../src/data/db.js";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import supertest from "supertest";

dotenv.config();
const endpoint = "/urls";
const request = new supertest(app);

describe(`Test ${endpoint}`, () => {
  const numberUrl = 5;
  let teenyUrls;

  beforeAll(async () => {
    db.connect(process.env.DB_TEST_URI);
    await teenyUrlDao.deleteAll();
  });

  beforeEach(async () => {
    await teenyUrlDao.deleteAll();
    teenyUrls = [];
    for (let index = 0; index < numberUrl; index++) {
      const url = faker.internet.url();
      const teenyUrl = await teenyUrlDao.create(url);
      teenyUrls.push(teenyUrl);
    }
  });

  describe("GET request", () => {
    it("Respond 405", async () => {
      const response = await request.get(`${endpoint}`);
      expect(response.status).toBe(405);
    });
  });

  describe("POST request", () => {
    it("Respond 201", async () => {
      const url = faker.internet.url();
      const response = await request.post(`${endpoint}`).send({url});
      expect(response.status).toBe(201);
    });

    describe("Respond 400", () => {
      it("Empty url", async () => {
        const url = "";
        const response = await request.post(`${endpoint}`).send({url});
        expect(response.status).toBe(400);
      });

      it("Null url", async () => {
        const url = null;
        const response = await request.post(`${endpoint}`).send({url});
        expect(response.status).toBe(400);
      });

      it("Undefined url", async () => {
        const url = undefined;
        const response = await request.post(`${endpoint}`).send({url});
        expect(response.status).toBe(400);
      });

      it("Invalid url", async () => {
        const url = "asdasf";
        const response = await request.post(`${endpoint}`).send({url});
        expect(response.status).toBe(400);
      });

      it("Url already mapped", async () => {
        const index = Math.floor(Math.random() * numberUrl);
        const teenyUrl = teenyUrls[index];
        const url = teenyUrl.url;
        const response = await request.post(`${endpoint}`).send({url});
        console.log(response);
        expect(response.status).toBe(400);
      });
    });
  });

  describe("GET request given ID", () => {
    it("Respond 200", async () => {
      const index = Math.floor(Math.random() * numberUrl);
      const teenyUrl = teenyUrls[index];
      const response = await request.get(`${endpoint}?id=${teenyUrl.id}`);
      console.log(response);
      expect(response.status).toBe(200);
    });

    it("Respond 400", async () => {
      const id = "1231";
      const response = await request.get(`${endpoint}?id=${id}`);
      expect(response.status).toBe(400);
    });

    it("Respond 404", async () => {
      const id = "6393f4ecc0d670ce53caa9ed";
      const response = await request.get(`${endpoint}?id=${id}`);
      expect(response.status).toBe(404);
    });
  });

  describe("PUT request", () => {
    it("Respond 405", async () => {
      const response = await request.put(`/urls/:id`);
      expect(response.status).toBe(405);
    });
  });

  describe("DELETE request", () => {
    it("Respond 200", async () => {
      const index = Math.floor(Math.random() * numberUrl);
      const teenyUrl = teenyUrls[index];
      const response = await request.delete(`${endpoint}?id=${teenyUrl.id}`);
      expect(response.status).toBe(200);
    });

    it("Respond 400", async () => {
      // TODO Implement me
    });

    it("Respond 404", async () => {
      const id = "6393f4ecc0d670ce53caa9ed"
      const response = await request.delete(`${endpoint}?id=${id}`);
      expect(response.status).toBe(404);
    });
  });

  describe("Redirect from short to long URL", () => {
    it("Respond 302", async () => {
      const index = 0;
      const teenyUrl = teenyUrls[0];
      const response = await request.get(`?key=${teenyUrl.key}`);
      expect(response.status).toBe(302);
    });

    it("Respond 404", async () => {
      const key = "asdasd"
      const response = await request.get(`?key=${key}`);
      expect(response.status).toBe(302);
    });
  });

  afterAll(async () => {
    await teenyUrlDao.deleteAll();
  });

});
