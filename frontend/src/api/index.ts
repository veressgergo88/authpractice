import axios, { AxiosError, AxiosResponse } from "axios"
import { z } from "zod"

type Response<Type> = {
  data: Type
  status: number
  success: true
} | {
  status: number
  success: false
}

const client = axios.create({
  baseURL: "http://localhost:3000"
})

const _signup = async (email: string, password: string): Promise<AxiosResponse | null> => {
  try {
    const response = await client.post("/api/signup", { email, password })
    return response
  } catch (error) {
    return (error as AxiosError).response || null
  }
}

/* const ImageResponse = z.object({
  id: z.number(),
  title: z.string(),
  url: z.string()
}).array()

type ImageResponse = z.infer<typeof ImageResponse>

const validateImages = (response: AxiosResponse): ImageResponse | null => {
  const result = ImageResponse.safeParse(response.data)
  if (!result.success) {
    return null
  }
  return result.data
} */

export const signup = async (email: string, password: string): Promise<Response<null>> => {
  const response = await _signup(email, password)
  if (!response)
    return { success: false, status: 0  }
  if (response.status !== 200)
    return { success: false, status: response.status  }
  /* const data = validateImages(response)
  if (!data)
    return { success: false, status: response.status  } */
  return { success: true, status: response.status, data: null }
}

const _login = async (email: string, password: string): Promise<AxiosResponse | null> => {
  try {
    const response = await client.post("/api/login", { email, password })
    return response
  } catch (error) {
    return (error as AxiosError).response || null
  }
}

const LoginResponse = z.object({
  sessionId: z.string()
})

type LoginResponse = z.infer<typeof LoginResponse>

const validateLoginResponse = (response: AxiosResponse): LoginResponse | null => {
  const result = LoginResponse.safeParse(response.data)
  if (!result.success) {
    return null
  }
  return result.data
}

export const login = async (email: string, password: string): Promise<Response<LoginResponse>> => {
  const response = await _login(email, password)
  if (!response)
    return { success: false, status: 0  }
  if (response.status !== 200)
    return { success: false, status: response.status  }
  const data = validateLoginResponse(response)
  if (!data)
    return { success: false, status: response.status  }
  return { success: true, status: response.status, data }
}

const _getMessages = async (): Promise<AxiosResponse | null> => {
  try {
    const sessionId = localStorage.getItem("sessionId")
    const response = await client.get("/api/messages", { headers: { authorization: sessionId }})
    return response
  } catch (error) {
    return (error as AxiosError).response || null
  }
}

const MessageSchema = z.object({
  id: z.number(),
  content: z.string(),
  email: z.string()
})

export type Message = z.infer<typeof MessageSchema>

const validateMessages = (response: AxiosResponse): Message[] | null => {
  const result = MessageSchema.array().safeParse(response.data)
  if (!result.success) {
    return null
  }
  return result.data
}

export const getMessages = async (): Promise<Response<Message[]>> => {
  const response = await _getMessages()
  if (!response)
    return { success: false, status: 0  }
  if (response.status !== 200)
    return { success: false, status: response.status  }
  const data = validateMessages(response)
  if (!data)
    return { success: false, status: response.status  }
  return { success: true, status: response.status, data }
}

const _postMessage = async (content: string): Promise<AxiosResponse | null> => {
  try {
    const sessionId = localStorage.getItem("sessionId")
    const response = await client
      .post("/api/messages", { content}, { headers: { authorization: sessionId }})
    return response
  } catch (error) {
    return (error as AxiosError).response || null
  }
}

const validateMessage = (response: AxiosResponse): Message | null => {
  const result = MessageSchema.safeParse(response.data)
  if (!result.success) {
    return null
  }
  return result.data
}

export const postMessage = async (content: string): Promise<Response<Message>> => {
  const response = await _postMessage(content)
  if (!response)
    return { success: false, status: 0  }
  if (response.status !== 200)
    return { success: false, status: response.status  }
  const data = validateMessage(response)
  if (!data)
    return { success: false, status: response.status  }
  return { success: true, status: response.status, data }
}