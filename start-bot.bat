@echo off
setlocal EnableDelayedExpansion

REM Read .env file and set variables
for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
    set "VAR=%%a"
    set "VAL=%%b"
    REM Remove surrounding quotes if present
    set "VAL=!VAL:"=!"
    set "!VAR!=!VAL!"
)

REM Run your compiled executable
LaunchWindows.exe
