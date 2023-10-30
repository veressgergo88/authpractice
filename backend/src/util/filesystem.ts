import fs from "fs/promises"
import { z } from "zod"

export const readFileSafe = async <S extends z.ZodTypeAny>(path: string, schema: S): Promise<z.infer<typeof schema> | null> => {

  const dbContent = await fs.readFile(path, "utf-8")
  const data = JSON.parse(dbContent)
  
  const dbParseResult = schema.safeParse(data)
  if (!dbParseResult.success)
    return null

  return dbParseResult.data
}

export const writeFileSafe = async (path: string, data:any) => {
  const newDbContent = JSON.stringify(data, null, 2)
  await fs.writeFile(path, newDbContent, "utf-8")
}