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

const validateData = (response: AxiosResponse, responseSchema: typeof PublicSchema | typeof SecretSchema): Public[] | Secret[] | null => {
    const result = responseSchema.array().safeParse(response.data)
    return result.success ? result.data : null
}

export const apiLoad = async (endPoint: string, visitorType: string): Promise<Response<Public[] | Secret[]>> => {
    const response = await client.get(endPoint)
    let schema: typeof PublicSchema | typeof SecretSchema
    visitorType === "secret" ? schema = SecretSchema : schema = PublicSchema
    const data = validateData(response, schema)
    return data ? { success: true, status: response.status, data } : { success: false, status: response.status  }
}