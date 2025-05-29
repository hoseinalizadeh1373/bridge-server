const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
  console.log('🔌 New client connected');
});

app.post('/event', (req, res) => {
  const data = req.body;
  console.log('📥 Event received:', data);
  
  // ارسال به همه کلاینت‌های متصل
  io.emit('event', data);

  res.send({ success: true });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
