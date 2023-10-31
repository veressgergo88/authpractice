import { Request, Response, NextFunction } from "express"
import { z } from "zod"
import { readFileSafe } from "../util/filesystem"
import { verify } from "jsonwebtoken"

const userDb = `${__dirname}/../../database/users.json`

const HeaderSchema = z.object({
  authorization: z.string(),
})

const SessionData = z.object({
  email: z.string(),
})

const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  password: z.string().min(3),
})

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const reqParseResult = HeaderSchema.safeParse(req.headers)
  if (!reqParseResult.success)
    return next()

  const payload = verify(reqParseResult.data.authorization, "serversecret")
  const result = SessionData.safeParse(payload)
  if (!result.success)
    return next()

  const email = result.data.email

  const existingUsers = await readFileSafe(userDb, UserSchema.array())
  if (!existingUsers)
    return next()

  const userToLogin = existingUsers.find(user => user.email === email)
  if (!userToLogin)
    return next()

  res.locals.user = userToLogin
  return next()
}