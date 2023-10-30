import express from "express";
import { writeFileSafe, readFileSafe } from "../util/filesystem";
import { z } from "zod";
import { auth } from "../middlewares/auth";

const router = express.Router()

const messageDb = `${__dirname}/../../database/messages.json`

const MessageSchema = z.object({
  id: z.number(),
  content: z.string(),
  email: z.string().email(),
})

const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  password: z.string().min(3),
})

type User = z.infer<typeof UserSchema>

router.get("", auth, async (req, res) => {
  if (!res.locals.user)
    return res.sendStatus(401)

  const messages = await readFileSafe(messageDb, MessageSchema.array())
  if (!messages)
    return res.sendStatus(500)

  return res.json(messages)
})

const MessageRequestSchema = z.object({
  content: z.string(),
})

router.post("", auth, async (req, res) => {
  if (!res.locals.user)
    return res.sendStatus(401)
  const user = res.locals.user as User

  const reqParseResult = MessageRequestSchema.safeParse(req.body)
  if (!reqParseResult.success)
    return res.sendStatus(400)

  const messages = await readFileSafe(messageDb, MessageSchema.array())
  if (!messages)
    return res.sendStatus(500)

  const newMessage = {
    id: Math.random(),
    ...reqParseResult.data,
    email: user.email
  }

  await writeFileSafe(messageDb, [ ...messages, newMessage ])

  return res.json(newMessage)
})

export default router