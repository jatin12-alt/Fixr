@echo off
echo Starting server...
npm run dev > server_output.txt 2>&1
echo Server output saved to server_output.txt
type server_output.txt
