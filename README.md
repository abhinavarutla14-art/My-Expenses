Personal Monthly Expense & Income Tracker (Angular PWA)

Project Goal
------------
Build a mobile-friendly Angular web app installable on my phone as a PWA — no backend, no database, no server deployment. Runs entirely in-browser and stores data on-device.

Tech requirements
-----------------
- Angular (latest stable), configured as a PWA via @angular/pwa
- No backend server, no SQL/NoSQL database
- Data persistence via browser localStorage
- Mobile-first responsive UI
- Fully functional offline once loaded

Core features
-------------
1. Add Transaction — Amount, Type (Income/Expense), Category (editable list), Date, Note (optional)
2. Monthly View — transactions for selected month, grouped by date
3. Month Navigation — move between previous/next month
4. Monthly Summary — Total Income, Total Expense, Net Savings for selected month
5. Category Breakdown — spending per category (list or simple chart)
6. Edit/Delete — edit or delete any transaction
7. Full History — all past months remain accessible, never auto-deleted
8. Manual Backup & Restore:
   - "Export" button — downloads all data as a .json file
   - "Import" button — restores data from a selected .json file
9. Automatic Month-End Archiving:
   - On app load, detect if the current calendar month differs from the last-recorded month in storage
   - If so, automatically save a snapshot of the just-finished month's data into a separate localStorage archive key (e.g., archive_2026_07)
   - Also attempt an automatic file download of that month's data as expenses_<Month>_<Year>.json
   - Show a one-time toast: "July's data has been archived and backed up ✅"

Nice-to-have (only if easy)
---------------------------
- Simple bar/pie chart for category-wise spending (ng2-charts or Chart.js)
- Dark mode toggle

Explicit constraints
--------------------
- No backend, no API calls, no database
- No internet required after first load
- Minimal dependencies — personal-use app
- Include README: how to run (`ng serve`), build (`ng build`), install as PWA, and how auto-archiving + manual export/import work

Next steps
----------
- Confirm if you want me to scaffold an Angular PWA in this workspace now.
- If yes, I will create the Angular project files and implement a minimal MVP: transactions list, add/edit, localStorage persistence, export/import, and month navigation.

Mobile usage
------------
The app is built as a PWA and should be run from the `my-expenses/dist/my-expenses/browser/` folder.

1. Build the app from the `my-expenses` folder:
   - `cd my-expenses`
   - `npx ng build`

2. Copy the entire `dist/my-expenses/browser/` folder to your phone.

3. Do not open `index.html` directly via `file://`.
   - Modern browsers often block Angular module scripts for local files.
   - Instead serve the folder over HTTP.

4. Best option from your computer:
   - `cd my-expenses/dist/my-expenses/browser`
   - `npx http-server -p 8080`
   - Then open `http://<your-computer-ip>:8080` from your phone.

5. If you want to run the app entirely on the phone:
   - Use a mobile local web server app or Termux with `python -m http.server 8080`.
   - Open the served URL in Chrome on the phone.

6. Once loaded in Chrome, use the browser menu to install the app as a PWA.

Notes
-----
- The app stores all data in-browser using `localStorage`.
- No backend or database is required.
- After first load, the app can work offline as a PWA.
