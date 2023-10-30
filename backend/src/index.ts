import express from "express"
import cors from "cors"
import messages from "./routes/messages"
import users from "./routes/user"

const app = express()
app.use(cors())
app.use(express.json())

app.use("/api/user", users)
app.use("/api/messages", messages)

const port = 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})