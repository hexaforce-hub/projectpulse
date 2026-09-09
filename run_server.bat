@echo off
title ProjectPulse Production Server — Smart India Hackathon 2026
echo ======================================================================
echo ProjectPulse — MoSPI IPMD Infrastructure Decision Intelligence
echo Team HexaForce — Smart India Hackathon 2026 (SIH26103)
echo ======================================================================
echo Starting offline-hardened FastAPI server on http://127.0.0.1:8000 ...
echo Press CTRL+C to terminate.
echo.
"%~dp0tools\python\python.exe" -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
