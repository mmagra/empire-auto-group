# Deploy Empire Auto Group on Hostinger (Business Web Hosting)

No environment variables are needed. Everything is set up from the website itself after the first deploy.

## 1. Make the zip

```bash
npm run deploy:zip
```

This creates `empire-auto-group-deploy.zip`: the source code only (no `node_modules`, no build folder, no database, no photos).

## 2. Create the Node.js app

**hPanel → Websites → Add website → Node.js app → Upload files**, choose the zip, and check these settings:

| Setting | Value |
|---|---|
| Framework | Next.js |
| Node.js version | 22.x |
| Install command | `npm install` |
| Build command | `npm run build` |
| Start command | `npm start` |
| Root folder | top of the zip (where `package.json` is) |
| Environment variables | **none** |

Use **`npm run build`**, not a plain `next build`. The npm script uses the Webpack builder, which avoids file names Hostinger's malware scanner has wrongly flagged.

Click **Deploy** (about 3–6 minutes). Connect the client's domain and turn on SSL in hPanel.

## 3. Create the owner account (do this right away)

Open `https://the-domain.com/admin`. On the very first visit it shows **"Welcome! Set Up Admin"**. Enter the owner's name, email and a password. That screen disappears for good once the first account exists. More admins can be added later in **Admin → Settings**.

## 4. Turn on lead emails

1. In hPanel go to **Emails**, and create a mailbox on the domain, e.g. `leads@the-domain.com`.
2. In the website go to **Admin → Settings → Lead Emails**:
   - **Send new leads to**: the owner's email (several allowed, separated by commas)
   - **SMTP server / port**: already filled in (`smtp.hostinger.com`, `465`)
   - **Mailbox email / password**: the mailbox from step 1
3. Click **Save & Send Test Email** and check the inbox (and spam).

Leads are always saved in **Admin → Leads**, even before email is set up.

## 5. Exclude `.next` from the malware scanner

In hPanel's malware scanner settings, exclude the app's `.next` folder. Hostinger's scanner has previously deleted compiled Next.js files, which makes single pages show a bare "Internal Server Error". If that ever happens, check the scanner's "actions taken" list first, then exclude `.next`, rebuild and restart.

## Where the data lives

The app keeps the database and uploaded photos in a folder **outside** the app, in the hosting account's home folder:

```
~/empire-auto-group-data/
    empire.db        cars, leads, admin accounts, settings
    uploads/         car photos
```

It's created automatically on first start. Because it's outside the app, **uploading a new version of the site never deletes cars, photos or leads.**

**Backups:** download `empire-auto-group-data/` from File Manager now and then.

## Updating the site later

Make changes locally, run `npm run deploy:zip`, upload the new zip to the same Node.js app and redeploy. Inventory, photos, leads and settings stay as they are.
