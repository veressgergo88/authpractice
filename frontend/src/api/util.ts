import axios, { AxiosError, AxiosRequestConfig } from "axios"
import { z } from "zod"

export type Response<Type> = {
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

const validate = <Schema extends z.ZodTypeAny>(data: unknown, schema: Schema): z.infer<typeof schema> | null => {
  const result = schema.safeParse(data)
  if (!result.success) {
    console.log(result.error)
    console.log(data)
    return null
  }
  return result.data
}

const safeReq = async (config: AxiosRequestConfig) => {
  const sessionId = localStorage.getItem("sessionId")
  config.headers = { Authorization: sessionId, ...config.headers }
  try {
    const response = await client.request(config)
    return response
  } catch (error) {
    return (error as AxiosError).response || null
  }
}

export const request = async <Schema extends z.ZodTypeAny>(config: AxiosRequestConfig, schema: Schema): Promise<Response<z.infer<typeof schema>>> => {
  const response = await safeReq(config)
  if (!response)
    return { success: false, status: 0  }
  if (response.status !== 200)
    return { success: false, status: response.status  }
  const data = validate(response.data, schema)
  if (!data)
    return { success: false, status: response.status  }
  return { success: true, status: response.status, data }
}