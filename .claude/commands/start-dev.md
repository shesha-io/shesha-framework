# Start Development Servers

Start both the backend and frontend development servers for the Shesha functional tests.

## Instructions

1. Start the backend server at `shesha-functional-tests/backend/src/Boxfusion.SheshaFunctionalTests.Web.Host` by running `dotnet run` in the background
2. Start the frontend server at `shesha-functional-tests/adminportal` by running `npm run dev` in the background
3. Wait a few seconds and verify both servers are running:
   - Backend: http://localhost:21021/swagger/index.html
   - Frontend: http://localhost:3000
4. Report the status of both servers to the user
