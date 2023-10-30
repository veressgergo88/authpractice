import { z } from "zod"
import { request } from "./util"

export const signup = async (email: string, password: string) => {
  return request({
    method: "POST",
    url: "/api/user/signup",
    data: { email, password }
  }, z.null())
}

const LoginResponse = z.object({
  sessionId: z.string()
})

export const login = async (email: string, password: string) => {
  return request({
      method: "POST",
      url: "/api/user/login",
      data: { email, password }
  }, LoginResponse)
}

const MessageSchema = z.object({
  id: z.number(),
  content: z.string(),
  email: z.string()
})

export const getMessages = async () => {
  return request({
    method: "GET",
    url: "/api/messages"
  }, MessageSchema.array())
}

export const postMessage = async (content: string) => {
  return request({
    method: "POST",
    url: "/api/messages",
    data: { content }
  }, MessageSchema)
}