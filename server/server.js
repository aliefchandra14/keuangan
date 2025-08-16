const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const { connectDB } = require('./config/db');
dotenv.config();
connectDB();

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

// Socket.IO
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000', credentials: true },
});

// Middleware
app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(helmet());
app.use(hpp());

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('User connected', socket.id);
});

app.use((req, res, next) => {
  req.io = io; // supaya controller bisa akses io
  next();
});

app.get("/", (req, res) => res.send("Hello World!"));
app.use('/api/v1/dashboard', require('./routes/dashboard'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`SERVER IS RUNNING IN MODE ${process.env.NODE_ENV} ON PORT ${PORT}`);
});
