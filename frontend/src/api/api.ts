import axios, { AxiosResponse } from "axios"
import { z } from "zod"

const client = axios.create({
  baseURL: "http://localhost:8080"
})

const PublicSchema = z.object({
    message: z.string()
})

const SecretSchema = z.object({
    Latitude: z.string(),
    Longitude: z.string()
})

export type Public = z.infer<typeof PublicSchema>
export type Secret = z.infer<typeof SecretSchema>

type Response<Type> = {
  data: Type
  status: number
  success: true
} | {
  status: number
  success: false
}

const validatePublicData = (response: AxiosResponse): Public[] | null => {
  const result = PublicSchema.array().safeParse(response.data)
  return result.success ? result.data : null
}

const validateSecretData = (response: AxiosResponse): Secret[] | null => {
  const result = SecretSchema.array().safeParse(response.data)
  return result.success ? result.data : null
}

export const publicDataLoad = async (): Promise<Response<Public[]>> => {
  const response = await client.get("api/public")
  const data = validatePublicData(response)
  return data ? { success: true, status: response.status, data } : { success: false, status: response.status  }
}

export const secretDataLoad = async (): Promise<Response<Secret[]>> => {
  const response = await client.get("api/secret")
  const data = validateSecretData(response)
  return data ? { success: true, status: response.status, data } : { success: false, status: response.status  }
}