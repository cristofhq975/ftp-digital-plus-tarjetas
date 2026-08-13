#!/bin/bash
cd /home/z/my-project
echo "[$(date)] Watchdog iniciado" > /home/z/my-project/watchdog.log

while true; do
  # Verificar si el servidor responde
  HTTP=$(curl --max-time 3 -s -o /dev/null -w "%{http_code}" "http://localhost:3000/" 2>/dev/null)
  
  if [ "$HTTP" != "200" ]; then
    echo "[$(date)] Server down (HTTP=$HTTP), restarting..." >> /home/z/my-project/watchdog.log
    # Matar todo
    pkill -9 -f "next dev" 2>/dev/null
    pkill -9 -f "next-server" 2>/dev/null
    pkill -9 -f "node.*next" 2>/dev/null
    fuser -k 3000/tcp 2>/dev/null
    sleep 3
    
    # Iniciar servidor
    NODE_OPTIONS="--max-old-space-size=1024" nohup bun run dev >> /home/z/my-project/dev.log 2>&1 &
    disown
    sleep 15
    
    # Pre-calentar compilacion
    curl --max-time 120 -s -o /dev/null "http://localhost:3000/" 2>/dev/null
    curl --max-time 30 -s -o /dev/null "http://localhost:3000/" 2>/dev/null
    echo "[$(date)] Server restarted and warmed" >> /home/z/my-project/watchdog.log
  fi
  sleep 10
done
