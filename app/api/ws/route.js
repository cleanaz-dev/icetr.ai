// app/api/ws/route.js
import { WebSocketServer } from 'ws';
import { NextRequest, NextResponse } from 'next/server';
import { createAdapter } from '@socket.io/adapter';
import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer((req, res) => {
  const nextRequest = new NextRequest(req);
  const nextResponse = new NextResponse();
  nextResponse.headers.set('Content-Type', 'text/plain');
  nextResponse.headers.set('Connection', 'close');
  nextResponse.end();
});

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws) => {
  console.log('📞 Twilio connected');

  let chunks = [];
  let aaiReady = false;

  const aaiSocket = new WebSocket('wss://streaming.assemblyai.com/v3/ws?sample_rate=8000&encoding=pcm_mulaw&format_turns=true', {
    headers: {
      Authorization: process.env.ASSEMBLYAI_API_KEY,
    },
  });

  aaiSocket.on('open', () => {
    console.log('🟢 Connected to AssemblyAI');
    aaiReady = true;
  });

  aaiSocket.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      
      if (data.type === 'Turn' && data.transcript) {
        console.log(`📝 Final: ${data.transcript}`);
        io.emit('transcription', { type: 'final', text: data.transcript });
      } else if (data.type === 'PartialTranscript' && data.text) {
        console.log(`📝 Partial: ${data.text}`);
        io.emit('transcription', { type: 'partial', text: data.text });
      } else if (data.error) {
        console.error('❌ AssemblyAI error:', data.error);
      }
    } catch (err) {
      console.error('❌ Failed to parse AssemblyAI message:', err);
    }
  });

  aaiSocket.on('error', (err) => console.error('❌ AssemblyAI socket error:', err));
  aaiSocket.on('close', () => console.log('🔌 AssemblyAI connection closed'));

  const sendInterval = setInterval(() => {
    if (chunks.length > 0 && aaiReady && aaiSocket.readyState === WebSocket.OPEN) {
      const audioBuffer = Buffer.concat(chunks);
      aaiSocket.send(audioBuffer);
      console.log(`▶️ Sent ${audioBuffer.length} bytes to AssemblyAI`);
      chunks = [];
    }
  }, 40);

  ws.on('message', (raw) => {
    try {
      const json = JSON.parse(raw);

      if (json.event === 'media' && json.media?.payload) {
        const audioData = Buffer.from(json.media.payload, 'base64');
        chunks.push(audioData);
      }

      if (json.event === 'stop') {
        console.log('⛔️ Call ended by Twilio');
        
        if (chunks.length > 0 && aaiSocket.readyState === WebSocket.OPEN) {
          const audioBuffer = Buffer.concat(chunks);
          aaiSocket.send(audioBuffer);
        }
        
        clearInterval(sendInterval);
        if (aaiSocket.readyState === WebSocket.OPEN) {
          aaiSocket.send(JSON.stringify({ terminate_session: true }));
          aaiSocket.close();
        }
      }
    } catch (err) {
      console.error('🚨 Invalid Twilio message:', err);
    }
  });

  ws.on('close', () => {
    console.log('🔒 Twilio socket closed');
    
    if (chunks.length > 0 && aaiSocket.readyState === WebSocket.OPEN) {
      const audioBuffer = Buffer.concat(chunks);
      aaiSocket.send(audioBuffer);
    }
    
    clearInterval(sendInterval);
    if (aaiSocket.readyState === WebSocket.OPEN) {
      aaiSocket.close();
    }
  });
});

export const GET = (req) => {
  return new NextResponse(null, { status: 200 });
};