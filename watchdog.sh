#!/bin/bash
cd /home/z/my-project
while true; do
  # Check if port 3000 is listening
  if ! ss -tlnp 2>/dev/null | grep -q ":3000 "; then
    echo "[$(date)] Port 3000 not listening, starting server..." >> /home/z/my-project/dev.log
    # Kill any leftover processes
    pkill -9 -f "next dev" 2>/dev/null
    sleep 1
    # Start server in background
    nohup npx next dev -p 3000 >> /home/z/my-project/dev.log 2>&1 &
    disown
    sleep 15
  else
    # Check if server responds
    HTTP=$(curl --max-time 5 -s -o /dev/null -w "%{http_code}" "http://localhost:3000/" 2>/dev/null)
    if [ "$HTTP" != "200" ] && [ "$HTTP" != "000" ]; then
      echo "[$(date)] Server returned $HTTP, restarting..." >> /home/z/my-project/dev.log
      pkill -9 -f "next dev" 2>/dev/null
      sleep 2
      nohup npx next dev -p 3000 >> /home/z/my-project/dev.log 2>&1 &
      disown
      sleep 15
    fi
  fi
  sleep 10
done
