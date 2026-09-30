import app from './app.js'
import { Config } from './config/env.js'

function startServer(): void {
    const PORT: number = Number(Config.port)

    app.listen(PORT, () => {
        console.log(`Server created at: ${PORT}`)
    })
}

startServer()
