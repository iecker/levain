@echo off

set currentFileDir=%~dp0

set TARGET_FILE=%1
set SHORTCUT_DIR=%USERPROFILE%\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup
set PWS=powershell.exe -ExecutionPolicy Bypass -NoLogo -NonInteractive -NoProfile
%PWS% -File %currentFileDir%createShortcut.ps1 "%TARGET_FILE%" "%SHORTCUT_DIR%" > nul
exit