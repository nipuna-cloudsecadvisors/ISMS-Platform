# ISMS Platform - Quick Start Guide

## For Complete Beginners

This guide will help you get the ISMS Platform running in just 5 minutes!

---

## Step 1: Install Docker Desktop

### Windows
1. Go to https://www.docker.com/products/docker-desktop/
2. Click "Download for Windows"
3. Run the installer
4. Restart your computer when prompted

### Mac
1. Go to https://www.docker.com/products/docker-desktop/
2. Click "Download for Mac"
3. Open the `.dmg` file
4. Drag Docker to Applications
5. Open Docker from Applications

### Linux
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
sudo usermod -aG docker $USER
# Log out and log back in
```

**Verify Docker is installed:**
```bash
docker --version
```

You should see something like: `Docker version 24.0.x`

---

## Step 2: Open Terminal

### Windows
1. Press `Windows Key + R`
2. Type `cmd`
3. Press Enter

### Mac
1. Press `Command + Space`
2. Type `terminal`
3. Press Enter

### Linux
Press `Ctrl + Alt + T`

---

## Step 3: Navigate to Project

In the terminal, type:

```bash
cd /workspace
```

*Replace `/workspace` with the actual location of the ISMS project on your computer.*

---

## Step 4: Start the Application

Copy and paste this command:

```bash
docker-compose up -d
```

**What this does:**
- Downloads required software (first time only)
- Sets up the database
- Starts the web application

**This will take 2-5 minutes the first time.**

You'll see output like:
```
Creating isms_db ... done
Creating isms_backend ... done
Creating isms_frontend ... done
```

---

## Step 5: Open Your Browser

1. Open any web browser (Chrome, Firefox, Safari, Edge)
2. Go to: **http://localhost:3000**

---

## Step 6: Login

Use these credentials:

**Email:** `admin@isms.local`  
**Password:** `admin123`

Click "Sign In"

---

## 🎉 Success!

You should now see the ISMS Platform dashboard!

---

## What's Next?

### Explore the Platform

1. **Dashboard** - See compliance status and metrics
2. **Controls** - View security controls and evidence
3. **Policies** - Read policy templates
4. **Risks** - Check the risk register
5. **Reports** - Generate compliance reports

### Try Different User Roles

Log out and log back in with these accounts to see different views:

**Compliance Officer:**
- Email: `compliance@isms.local`
- Password: `compliance123`

**Employee (for policy acknowledgment):**
- Email: `employee@isms.local`
- Password: `employee123`

**External Auditor (read-only):**
- Email: `auditor@external.com`
- Password: `auditor123`

---

## Common Issues

### "Cannot connect to the Docker daemon"
**Solution:** Make sure Docker Desktop is running. Look for the Docker icon in your system tray (Windows/Mac) or run `sudo systemctl start docker` (Linux).

### Port 3000 is already in use
**Solution:** Another application is using port 3000. Stop that application or change the port in `docker-compose.yml`.

### Page is blank or loading forever
**Solution:** Wait 30-60 seconds after starting. The application needs time to initialize.

Check if it's ready:
```bash
docker-compose logs backend | grep "Application startup complete"
```

---

## Stopping the Application

When you're done, stop the application:

```bash
docker-compose stop
```

## Starting Again Later

```bash
docker-compose up -d
```

---

## Need More Help?

See the [Full Deployment Guide](DEPLOYMENT_GUIDE.md) for detailed troubleshooting.

---

## Quick Command Reference

```bash
# Start application
docker-compose up -d

# Stop application
docker-compose stop

# See what's running
docker-compose ps

# View logs
docker-compose logs

# Restart everything
docker-compose restart

# Complete reset (deletes all data!)
docker-compose down -v
docker-compose up -d
```

---

That's it! Enjoy using the ISMS Platform! 🚀🔒
