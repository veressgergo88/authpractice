import { Request, Response, NextFunction } from "express"
import { z } from "zod"
import { readFileSafe } from "../util/filesystem"

const sessionDb = `${__dirname}/../../database/sessions.json`
const userDb = `${__dirname}/../../database/users.json`

const HeaderSchema = z.object({
  authorization: z.string(),
})

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

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const reqParseResult = HeaderSchema.safeParse(req.headers)
  if (!reqParseResult.success)
    return next()

  const sessionId = reqParseResult.data.authorization

  const sessions = await readFileSafe(sessionDb, SessionDBSchema)
  if (!sessions)
    return next()

  const session = sessions[sessionId]

  if (!session)
    return next()

  const nowMillis = new Date().getTime()
  const createdAtMillis = new Date(session.createdAt).getTime()

  if (nowMillis > createdAtMillis + 20*1000)
    return undefined

  const existingUsers = await readFileSafe(userDb, UserSchema.array())
  if (!existingUsers)
    return next()

  const userToLogin = existingUsers.find(user => user.email === session.email)
  if (!userToLogin)
    return next()

  res.locals.user = userToLogin
  return next()
}