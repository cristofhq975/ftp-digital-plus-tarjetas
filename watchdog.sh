#!/bin/bash
cd /home/z/my-project
while true; do
  echo "[$(date)] === Starting Next.js ===" >> /home/z/my-project/watchdog.log
  # Start server
  npx next dev -p 3000 --webpack >> /home/z/my-project/dev.log 2>&1
  EXIT=$?
  echo "[$(date)] Server exited ($EXIT), restarting in 2s..." >> /home/z/my-project/watchdog.log
  pkill -9 -f "next" 2>/dev/null
  fuser -k 3000/tcp 2>/dev/null
  sleep 2
done
