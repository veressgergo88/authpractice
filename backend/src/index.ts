import express, { Request } from "express"
import cors from "cors"
import { z } from "zod"
import fs from "fs/promises"
import { hash, validate } from "./util/hash"

const userDb = `${__dirname}/../database/users.json`
const messageDb = `${__dirname}/../database/messages.json`
const sessionDb = `${__dirname}/../database/sessions.json`

const app = express()
app.use(cors())
app.use(express.json())

const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  password: z.string().min(3),
})

type User = z.infer<typeof UserSchema>

const SessionSchema = z.object({
  email: z.string().email(),
  createdAt: z.string().datetime({ offset: true }),
})

const SessionDBSchema = z.record(SessionSchema)

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

  const dbContent = await fs.readFile(userDb, "utf-8")
  const data = JSON.parse(dbContent)
  
  const dbParseResult = UserSchema.array().safeParse(data)
  if (!dbParseResult.success)
    return res.sendStatus(500)

  const existingUsers = dbParseResult.data

  const userAlreadyExists = existingUsers.some(user => user.email === newUser.email)

  if (userAlreadyExists)
    return res.sendStatus(409)

  const newDbContent = JSON.stringify([ ...existingUsers, newUser ], null, 2)
  await fs.writeFile(userDb, newDbContent, "utf-8")

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

  const dbContent = await fs.readFile(userDb, "utf-8")
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

  const sessionId = Math.random().toString()

  const sessionDbContent = await fs.readFile(sessionDb, "utf-8")
  const sessionData = JSON.parse(sessionDbContent)
  
  const sessionDbParseResult = SessionDBSchema.safeParse(sessionData)
  if (!sessionDbParseResult.success)
    return res.sendStatus(500)

  const sessions = sessionDbParseResult.data

  sessions[sessionId] = {
    email: userToLogin.email,
    createdAt: new Date().toISOString()
  }

  const newDbContent = JSON.stringify(sessions, null, 2)
  await fs.writeFile(sessionDb, newDbContent, "utf-8")

  return res.json({ sessionId })
})

const HeaderSchema = z.object({
  authorization: z.string(),
})

const auth = async (req: Request): Promise<User | undefined> => {
  const reqParseResult = HeaderSchema.safeParse(req.headers)
  if (!reqParseResult.success)
    return undefined

  const sessionId = reqParseResult.data.authorization

  const dbContent = await fs.readFile(sessionDb, "utf-8")
  const data = JSON.parse(dbContent)
  
  const dbParseResult = SessionDBSchema.safeParse(data)
  if (!dbParseResult.success)
    return undefined

  const sessions = dbParseResult.data

  const session = sessions[sessionId]

  if (!session)
    return undefined

  const nowMillis = new Date().getTime()
  const createdAtMillis = new Date(session.createdAt).getTime()

  if (nowMillis > createdAtMillis + 20*1000)
    return undefined

  const userDbContent = await fs.readFile(userDb, "utf-8")
  const userData = JSON.parse(userDbContent)
  
  const userDbParseResult = UserSchema.array().safeParse(userData)
  if (!userDbParseResult.success)
    return undefined

  const existingUsers = userDbParseResult.data

  const userToLogin = existingUsers.find(user => user.email === session.email)
  if (!userToLogin)
    return undefined

  return userToLogin
}

app.get("/api/messages", async (req, res) => {

  const user = await auth(req)
  if (!user)
    return res.sendStatus(401)

  const dbContent = await fs.readFile(messageDb, "utf-8")
  const data = JSON.parse(dbContent)
  
  const dbParseResult = MessageSchema.array().safeParse(data)
  if (!dbParseResult.success)
    return res.sendStatus(500)

  const messages = dbParseResult.data

  res.json(messages)
})

const MessageRequestSchema = z.object({
  content: z.string(),
})

app.post("/api/messages", async (req, res) => {

  const user = await auth(req)
  if (!user)
    return res.sendStatus(401) // Unauthorized  (Unauthenticated)

  const reqParseResult = MessageRequestSchema.safeParse(req.body)
  if (!reqParseResult.success)
    return res.sendStatus(400)

  const dbContent = await fs.readFile(messageDb, "utf-8")
  const data = JSON.parse(dbContent)
  
  const dbParseResult = MessageSchema.array().safeParse(data)
  if (!dbParseResult.success)
    return res.sendStatus(500)

  const messages = dbParseResult.data

  const newMessage = {
    id: Math.random(),
    ...reqParseResult.data,
    email: user.email
  }

  const newDbContent = JSON.stringify([ ...messages, newMessage ], null, 2)
  await fs.writeFile(messageDb, newDbContent, "utf-8")

  return res.json(newMessage)
})

const port = 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})