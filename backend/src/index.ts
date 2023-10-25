import express from "express"
import cors from "cors"
import { z } from "zod"
import fs from "fs/promises"
import { hash, validate } from "./util/hash"

const dbFile = `${__dirname}/../database/users.json`

const app = express()
app.use(cors())
app.use(express.json())

const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  password: z.string().min(3),
})

const MessageSchema = z.object({
  id: z.number(),
  content: z.string(),
  email: z.string().email(),
})

const SignupRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3)
})

app.post('/api/signup', async (req, res) => {

  const reqParseResult = SignupRequestSchema.safeParse(req.body)
  if (!reqParseResult.success)
    return res.sendStatus(400)

  const hashedPassword = await hash(reqParseResult.data.password)
  const newUser = {
    id: Math.random(),
    email: reqParseResult.data.email,
    password: hashedPassword
  }

  const dbContent = await fs.readFile(dbFile, "utf-8")
  const data = JSON.parse(dbContent)
  
  const dbParseResult = UserSchema.array().safeParse(data)
  if (!dbParseResult.success)
    return res.sendStatus(500)

  const existingUsers = dbParseResult.data

  const userAlreadyExists = existingUsers.some(user => user.email === newUser.email)

  if (userAlreadyExists)
    return res.sendStatus(409)

  const newDbContent = JSON.stringify([ ...existingUsers, newUser ], null, 2)
  await fs.writeFile(dbFile, newDbContent, "utf-8")

  return res.sendStatus(200)
})

const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3)
})

app.post('/api/login', async (req, res) => {
  
  const reqParseResult = LoginRequestSchema.safeParse(req.body)
  if (!reqParseResult.success)
    return res.sendStatus(400)

  const dbContent = await fs.readFile(dbFile, "utf-8")
  const data = JSON.parse(dbContent)
  
  const dbParseResult = UserSchema.array().safeParse(data)
  if (!dbParseResult.success)
    return res.sendStatus(500)

  const existingUsers = dbParseResult.data

  const userToLogin = existingUsers.find(user => user.email === reqParseResult.data.email)

  if (!userToLogin)
    return res.sendStatus(401)

  const passwordMatches = await validate(reqParseResult.data.password, userToLogin.password)

  if (!passwordMatches)
    return res.sendStatus(401)

  return res.sendStatus(200)
})

app.get("/api/messages", async (req, res) => {
  const dbContent = await fs.readFile(dbFile, "utf-8")
  const data = JSON.parse(dbContent)
  
  const dbParseResult = MessageSchema.array().safeParse(data)
  if (!dbParseResult.success)
    return res.sendStatus(500)

  const messages = dbParseResult.data

  res.json(messages)
})

const MessageRequestSchema = z.object({
  content: z.string(),
  email: z.string().email()
})

app.post("/api/messages", async (req, res) => {
  const reqParseResult = MessageRequestSchema.safeParse(req.body)
  if (!reqParseResult.success)
    return res.sendStatus(400)

  const dbContent = await fs.readFile(dbFile, "utf-8")
  const data = JSON.parse(dbContent)
  
  const dbParseResult = MessageSchema.array().safeParse(data)
  if (!dbParseResult.success)
    return res.sendStatus(500)

  const messages = dbParseResult.data

  const newMessage = {
    id: Math.random(),
    ...reqParseResult.data
  }

  const newDbContent = JSON.stringify([ ...messages, newMessage ], null, 2)
  await fs.writeFile(dbFile, newDbContent, "utf-8")

  return res.sendStatus(200)
})

const port = 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})