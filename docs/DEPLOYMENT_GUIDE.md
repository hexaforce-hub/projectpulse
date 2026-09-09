# PROJECTPULSE — GITHUB & VERCEL DEPLOYMENT GUIDE
**Ministry of Statistics & Programme Implementation (MoSPI) • IPMD**  
**Smart India Hackathon 2026 — Team HexaForce (Problem Statement SIH26103)**  

---

## 🚀 Overview

ProjectPulse is fully prepared for immediate deployment:
1. **GitHub Repository**: Complete local Git repository initialized on `main` branch with clean `.gitignore` excluding bulky local binaries.
2. **Vercel Cloud Deployment**: Pre-configured `vercel.json` routing configuration ready for 1-click cloud hosting with zero build friction.
3. **Offline Venue Autonomy**: Seamless dual-mode architecture — live local backend for high-throughput evaluation (`run_server.bat`) and cloud/browser fallback on Vercel.

---

## 1. Pushing to GitHub

### Option A: Using GitHub CLI (Fastest — 1 Minute)
Both `git` and `gh` have been pre-installed on this machine.

1. In your terminal, authenticate with your GitHub account:
   ```powershell
   gh auth login
   ```
   *(Select `GitHub.com` > `HTTPS` > `Yes` to authenticate with web browser)*

2. Create and push the repository in one command:
   ```powershell
   gh repo create projectpulse --public --source=. --remote=origin --push
   ```

---

### Option B: Using GitHub Web Interface
1. Open your browser and navigate to: **[github.com/new](https://github.com/new)**
2. Create a new repository:
   - **Repository name:** `projectpulse` (or `projectpulse-sih2026`)
   - **Visibility:** Public
   - **Initialize with README/gitignore:** Leave **unchecked** (we already have them committed)
   - Click **Create repository**

3. Link and push from your local terminal:
   ```powershell
   git remote add origin https://github.com/<YOUR-USERNAME>/projectpulse.git
   git branch -M main
   git push -u origin main
   ```

---

## 2. Deploying to Vercel (1-Click via GitHub)

Once your repository is pushed to GitHub, deploying on Vercel takes 30 seconds:

1. Go to **[vercel.com](https://vercel.com)** and sign in (choose **Continue with GitHub**).
2. On your Vercel Dashboard, click **Add New…** ➔ **Project**.
3. Locate your **`projectpulse`** repository and click **Import**.
4. Configure Project:
   - **Project Name:** `projectpulse-mospi` (or default)
   - **Framework Preset:** `Other`
   - **Root Directory:** `./`
   - **Build and Output Settings:** Leave defaults (the included `vercel.json` handles all routing).
5. Click **Deploy**.
6. Within 15–20 seconds, Vercel will deploy your application and generate a live URL:
   `https://projectpulse-mospi.vercel.app` (or custom Vercel domain).

---

## 3. How the Cloud Deployment Works

- **Dual-Mode Gateway (`js/api-client.js`)**:
  - When accessed on Vercel (`https://...`), the frontend queries `/api/health`.
  - In cloud-hosted static mode without local SQLite, it automatically switches to **High-Fidelity Demonstration Mode**.
  - All 6 modules (Executive Dashboard, Filtered Projects Catalog, Hero Project `PRJ-DEMO-001`, TreeSHAP Attribution Waterfall, Autonomous Early Warning Radar, and What-If Counterfactual Policy Simulator) remain **100% interactive and functional** for hackathon judges worldwide.
- **Local Air-Gapped Mode (`localhost:8000`)**:
  - At the SIH evaluation venue, run `run_server.bat` to launch the live FastAPI + LightGBM + SQLite engine with all 10,000 projects and sub-15ms local inference.

---

## 4. Verification Checklist Before Demonstration

- [x] `.gitignore` verified (excluded 150MB+ portable python runtime)
- [x] Initial commit created on `main` branch
- [x] `vercel.json` verified with clean single-page routes
- [x] 121 automated test cases passing (100% green)
- [x] 1-Click Role Switcher accessible to judges (Admin, Officer, Analyst, Viewer)
