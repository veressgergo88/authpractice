import express from "express";
import { writeFileSafe, readFileSafe } from "../util/filesystem";
import { z } from "zod";
import { hash, validate } from "../util/hash"

const userDb = `${__dirname}/../../database/users.json`
const sessionDb = `${__dirname}/../../database/sessions.json`

const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  password: z.string().min(3),
})

const SessionSchema = z.object({
  email: z.string().email(),
  createdAt: z.string().datetime({ offset: true }),
})

const SessionDBSchema = z.record(SessionSchema)

const SignupRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3)
})

const router = express.Router()

router.post('/signup', async (req, res) => {

  const reqParseResult = SignupRequestSchema.safeParse(req.body)
  if (!reqParseResult.success)
    return res.sendStatus(400)

  const hashedPassword = await hash(reqParseResult.data.password)
  const newUser = {
    id: Math.random(),
    email: reqParseResult.data.email,
    password: hashedPassword
  }

  const existingUsers = await readFileSafe(userDb, UserSchema.array())
  if (!existingUsers)
    return res.sendStatus(500)

  const userAlreadyExists = existingUsers.some(user => user.email === newUser.email)

  if (userAlreadyExists)
    return res.sendStatus(409)

  await writeFileSafe(userDb, [ ...existingUsers, newUser ])

  return res.sendStatus(200)
})

const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3)
})

router.post('/login', async (req, res) => {
  
  const reqParseResult = LoginRequestSchema.safeParse(req.body)
  if (!reqParseResult.success)
    return res.sendStatus(400)

    const existingUsers = await readFileSafe(userDb, UserSchema.array())
    if (!existingUsers)
      return res.sendStatus(500)

  const userToLogin = existingUsers.find(user => user.email === reqParseResult.data.email)

  if (!userToLogin)
    return res.sendStatus(401)

  const passwordMatches = await validate(reqParseResult.data.password, userToLogin.password)

  if (!passwordMatches)
    return res.sendStatus(401)

  const sessionId = Math.random().toString()

  const sessions = await readFileSafe(sessionDb, SessionDBSchema)
  if (!sessions)
    return res.sendStatus(500)

  sessions[sessionId] = {
    email: userToLogin.email,
    createdAt: new Date().toISOString()
  }

  await writeFileSafe(sessionDb, sessions)

  return res.json({ sessionId })
})

export default router