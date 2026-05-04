import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ERP System - IT Company Management',
  description: 'Employee, Project, and Finance Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
