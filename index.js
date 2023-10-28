const express = require("express");
const morgan = require("morgan");
const app = express();
const bodyParser = require("body-parser");
const port = process.env.PORT;
require("./db/mongoose");
const userRouter = require("./routers/user.routes");
const adminRouter = require("./routers/admin.routes");
const cors = require("cors");
const https = require('https')
const fs = require('fs')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use(morgan("tiny"));
// app.use(
//   cors({
//     exposedHeaders: ["Content-Length", "x-auth-token"],
//     origin: "*",
//   })
// );


app.use("/internal/api/users", userRouter);
app.use("/internal/api/admin", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404).json({
    message: "No such route exists",
  });
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    message: err
  })
});
// const httpsServer = https.createServer({
//   ca: fs.readFileSync('./ssl/bundle.crt'),
//   key: fs.readFileSync('./ssl/thedistinguishedsociety.com.key'),
//   cert: fs.readFileSync('./ssl/thedistinguishedsociety.crt'),
// }, app);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

// httpsServer.listen(9000, () => {
//   console.log('https server running on port 9000');
// })

