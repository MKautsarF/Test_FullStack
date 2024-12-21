const app = require('express');
const PORT = 8080;

app.listen(
    PORT,
    () => console.log(`masuk on http:localhost:${PORT}`)
)