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

const extenSockets = {}; // { exten: [socketId1, socketId2, ...] }

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // ثبت exten توسط کلاینت
  socket.on('register_exten', ({ exten }) => {
    console.log(`📲 Exten ${exten} registered for socket ${socket.id}`);
    if (!extenSockets[exten]) extenSockets[exten] = [];
    extenSockets[exten].push(socket.id);
  });

  // حذف از لیست در زمان قطع اتصال
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
    for (const exten in extenSockets) {
      extenSockets[exten] = extenSockets[exten].filter(id => id !== socket.id);
      if (extenSockets[exten].length === 0) {
        delete extenSockets[exten];
      }
    }
  });
});

// دریافت ایونت از افزونه وردپرس
app.post('/event', (req, res) => {
  const data = req.body;
  const targetExten = data.exten;

  console.log(`📥 Event received for exten ${targetExten}:`, data);

  if (extenSockets[targetExten]) {
    extenSockets[targetExten].forEach(socketId => {
      io.to(socketId).emit('event', data);
    });
    res.send({ success: true });
  } else {
    console.log(`⚠️ No clients registered for exten ${targetExten}`);
    res.status(404).send({ error: 'No client connected for this exten' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
