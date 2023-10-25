import bcrypt from "bcrypt"

const saltRounds = 10

export const hash = async (password: string) => {
  const salt = await bcrypt.genSalt(saltRounds)
  const hashedPassword = await bcrypt.hash(password, salt!)
  return hashedPassword
}

export const validate = async(password: string, hash: string) => {
    const result = await bcrypt.compare(password, hash)
    return result
}