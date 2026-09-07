# 💼 Looksmen Finance Portal

<div align="center">
  <img src="public/0-logo.webp" alt="Looksmen Logo" width="90" height="90" style="border-radius: 18px;" />
  <h3>Looksmen Expense & Revenue Tracking System</h3>
  <p>A modern, high-performance financial management and bookkeeping platform built for Looksmen business operations.</p>

  [![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Cloudinary](https://img.shields.io/badge/Cloudinary-Image_Upload-3448C5?style=for-the-badge&logo=cloudinary)](https://cloudinary.com/)
</div>

---

## 📌 Features Overview

### 1. 📊 Executive Dashboard (`/`)
* **2x2 Mobile Responsive Summary Metrics**:
  * **Net Balance / Profit**: Dynamic calculation with positive cashflow/deficit status indicators.
  * **Total Revenue / Income**: Live income tally with total count badges.
  * **Total Expenses**: Real-time business spending monitor.
  * **Total Transactions**: Total operations counter.
* **Quick Actions**:
  * `+ Add Income` & `+ Add Expense` with modal popup.
  * `Export / Report` generation modal (CSV / PDF export).
  * Fast data refresh button.
* **Operational Analytics Breakdown**:
  * Dynamic visual expense & income distribution by Category.
  * Staff / Operator transaction breakdown & net balance contribution.
  * Interactive filter clicks directly from charts.
* **Recent Transactions Feed**:
  * Shows top 5 most recent transactions with instant view/edit/delete actions.
  * Direct `History →` button leading to the full transaction history.

---

### 2. 📑 All Transactions History (`/transactions` & `/history`)
* **Flexible Pagination (25 / 50 / 100 per page)**:
  * Top bar: **Per page dropdown** (`25`, `50`, `100`) on the left, and **Showing count** (`Showing 1–25 of 120`) on the right.
  * Bottom bar: Full page navigation with **First**, **Previous**, **Page numbers (1, 2, 3...)**, **Next**, and **Last**.
* **Comprehensive Timeframe & Filter Bar**:
  * **Timeframe Presets**: `Today`, `This Week`, `This Month`, `This Year`, `Custom Range`, `All Time`.
  * **Date Pickers**: Start & End Date selectors when `Custom Range` is selected.
  * **Live Search**: Instant search by notes, category, staff name, or payment method.
  * **Type Filter**: `All Types (Income & Expense)`, `Income Only`, `Expense Only`.
  * **Category Filter**: Filter across all business expense & income categories.
  * **Staff (Recorded By) Filter**: Filter entries recorded by specific operators/staff.
  * **Reset Filters**: One-click filter reset.
* **Filtered Metrics Strip**: Live summary of Filtered Income, Filtered Expense, and Net Flow for currently active filters.

---

### 3. 📸 Cloudinary Receipt & Memo Image Upload
* Seamless invoice/memo/voucher upload for any transaction.
* Direct upload to Cloudinary inside the `looksmen` folder with WebP optimization (`quality: 'auto:good'`).
* Instant receipt thumbnail preview with **Fullscreen Lightbox / Zoom modal**.
* In-memory / base64 fallback for offline or zero-configuration development.

---

### 4. 🗂️ Data Management & Export
* **CRUD Operations**: Add, Edit, View, and Delete transactions with instant feedback toasts.
* **Report Exporting**: Export filtered transactions into formatted spreadsheet/CSV summaries.
* **Dual Database Layer**: PostgreSQL database powered by Prisma ORM with built-in in-memory fallback store (`mockStore.ts`) ensuring zero downtime during testing or configuration.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Frontend Library** | React 19 |
| **Language** | TypeScript |
| **State & Data Fetching** | TanStack React Query v5 |
| **Styling & Design** | Tailwind CSS v4, Lucide Icons, React Icons |
| **Database & ORM** | PostgreSQL & Prisma ORM |
| **Cloud Media Storage** | Cloudinary SDK (WebP compression) |
| **Date Formatting** | date-fns |

---

## 📁 Project Structure

```text
├── prisma/
│   └── schema.prisma              # PostgreSQL database schema
├── public/
│   ├── 0-logo.webp                # Looksmen logo icon
│   └── logo.webp                  # Main brand asset
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── stats/route.ts     # Financial metrics & analytics API
│   │   │   ├── transactions/      # Transactions CRUD APIs
│   │   │   └── upload/route.ts    # Cloudinary image upload API
│   │   ├── history/page.tsx       # Alias route for transaction history
│   │   ├── transactions/page.tsx  # Full Transactions History page (paginated)
│   │   ├── layout.tsx             # Root layout with QueryProvider
│   │   ├── page.tsx               # Main Dashboard
│   │   └── globals.css            # Global CSS & Tailwind styling
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── AnalyticsBreakdown.tsx  # Category & Staff breakdown charts
│   │   │   ├── FilterBar.tsx           # Multi-criteria filter & search bar
│   │   │   ├── QuickActionButtons.tsx  # Action bar (+ Income, + Expense, Export)
│   │   │   └── SummaryCards.tsx        # 2x2 Mobile & 4-col Desktop summary cards
│   │   ├── transactions/
│   │   │   ├── ImageViewerModal.tsx    # Receipt viewer lightbox
│   │   │   ├── Pagination.tsx          # Top/Bottom pagination controls
│   │   │   ├── TransactionCard.tsx     # Transaction card item component
│   │   │   ├── TransactionList.tsx     # List wrapper with loading/empty states
│   │   │   └── TransactionModal.tsx    # Add / Edit transaction modal
│   │   ├── ui/
│   │   │   ├── ConfirmModal.tsx        # Destructive confirmation modal
│   │   │   ├── ExportReportModal.tsx   # CSV / Report exporter modal
│   │   │   └── Toast.tsx               # Dynamic toast notifications
│   │   └── providers/
│   │       └── QueryProvider.tsx       # TanStack Query client provider
│   ├── hooks/
│   │   └── useTransactions.ts          # React Query custom hooks for CRUD & stats
│   ├── lib/
│   │   ├── cloudinary.ts          # Cloudinary configuration & upload helper
│   │   ├── db.ts                  # Prisma database client singleton
│   │   ├── formatters.ts          # Currency (BDT ৳) & date formatters
│   │   ├── imageUtils.ts          # Client-side image compression
│   │   └── mockStore.ts           # Fallback in-memory storage
│   └── types/
│       └── transaction.ts         # TypeScript interfaces & category constants
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/arju-Hasan/Looksmen-wallets.git
cd Looksmen-wallets
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# PostgreSQL Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/looksmen_finance?schema=public"

# Cloudinary Storage Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### 4. Setup the Database
```bash
# Push Prisma schema to PostgreSQL
npx prisma db push

# (Optional) Open Prisma Studio to inspect data
npx prisma studio
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Build for Production

```bash
npm run build
npm run start
```

---

## 👨‍💻 Author & Credits

* **Developed for**: Looksmen Brand Financial Operations
* **Repository**: [arju-Hasan/Looksmen-wallets](https://github.com/arju-Hasan/Looksmen-wallets)
