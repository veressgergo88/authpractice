import express from "express"
import type { Request, Response } from "express";
import { z } from "zod";
import fs from 'fs-extra'
import cors from "cors"

const server = express();
const port = 8080
server.use(cors())
server.use(express.json());

const PublicSchema = z.object({
  message: z.string()
})

const SecretSchema = z.object({
  Latitude: z.string(),
  Longitude: z.string()
})

server.get('/api/public', async (req: Request, res: Response) => {
  const response = await fs.readJson('./database/public.json')
  const result = PublicSchema.array().safeParse(response)
  
  if (!result.success)
    res.sendStatus(400)
  else
    res.json(result.data)  
})

server.get('/api/secret', async (req: Request, res: Response) => {
    const response = await fs.readJson('./database/secret.json')
    const result = SecretSchema.array().safeParse(response)
    
    if (!result.success)
      res.sendStatus(400)
    else
      res.json(result.data)  
  })

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})