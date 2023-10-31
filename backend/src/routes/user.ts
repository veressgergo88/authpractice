import express from "express";
import { writeFileSafe, readFileSafe } from "../util/filesystem";
import { z } from "zod";
import { hash, validate } from "../util/hash"
import { sign } from "jsonwebtoken"

const userDb = `${__dirname}/../../database/users.json`

const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  password: z.string().min(3),
})

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

  const sessionId = sign({ email: userToLogin.email }, "serversecret", { expiresIn: "2h" })
  return res.json({ sessionId })
})

export default router