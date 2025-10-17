import express from "express";
import { CLIENT_RENEG_LIMIT } from "tls";

const app = express();

const port = process.env.PORT || 8989

app.get('/', (request, response) => {
	response.send("<h1>Hello This is our App!</h1>")
})
app.get('/login', (request, response) => {
	response.send("<h1>Hello This is our Login Page!</h1>")
})

app.listen(port, () => {
  console.log(`The application is running on port http://localhost:${port}`);
});
