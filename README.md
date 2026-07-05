# Placid

Placid is a modern Contact Management System (CRM) built with Next.js, tailored for professionals who need to track client consultations efficiently.

## Features

- **Authentication**: Secure login system to protect your contact database.
- **Contact Management**: Add, view, delete, and manage contacts seamlessly through an intuitive dashboard.
- **Consultation Tracking**: Log consultation dates for each contact to keep track of past interactions.
- **Advanced Filtering & Search**:
  - Search contacts by name or email.
  - Filter based on consultation status (e.g., everyone, at least one consultation, or no consultations).
  - **Inactivity Filter**: Find clients who haven't had a consultation in the last X months (or never had one) to easily plan re-engagement strategies.
  - **Followup Status**: Track and filter contacts based on whether a followup email has been sent, making it easier to manage outreach campaigns.
- **Email Export**: Export the email addresses of your currently filtered contacts directly to your clipboard for quick use in any email client.
- **Resilient Database Connection**: Built to connect to a remote PostgreSQL database, with an automatic fallback to an in-memory mock database if the connection fails. This ensures uninterrupted development and testing.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Styling**: Custom CSS focusing on a modern, glass-panel aesthetic.
- **Icons**: [Lucide React](https://lucide.dev)
- **Database**: PostgreSQL (configured via `.env.local`)

## Getting Started

### 1. Environment Configuration

Copy the example environment file to set up your local configuration:

```bash
cp .env.example .env.local
```

Update the `.env.local` file with your database credentials. If the database is unreachable, the app will automatically fall back to an in-memory mock dataset.

### 2. Run the Development Server

Install the dependencies and start the development server:

```bash
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 3. Usage

1. Log in using your credentials.
2. Navigate the dashboard to add new contacts.
3. Open a contact card to add a new consultation date.
4. Use the top search bar and filter dropdowns to find specific groups of clients, such as those inactive for a specific number of months.
5. Click **"Esporta Email"** to quickly copy the emails of your filtered results.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
