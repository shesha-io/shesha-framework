# Stop Development Servers

Stop both the backend and frontend development servers for the Shesha functional tests.

## Instructions

1. Kill any process listening on port 3000 (frontend) using:
   ```bash
   netstat -ano | grep ":3000" | grep "LISTENING" | awk '{print $5}' | xargs -r -I{} taskkill //F //PID {}
   ```

2. Kill any process listening on port 21021 (backend) using:
   ```bash
   netstat -ano | grep ":21021" | grep "LISTENING" | awk '{print $5}' | xargs -r -I{} taskkill //F //PID {}
   ```

3. Verify both servers are stopped by checking that connections to http://localhost:3000 and http://localhost:21021 fail

4. Report the status to the user
