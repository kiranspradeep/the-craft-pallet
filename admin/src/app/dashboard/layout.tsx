// dashboard/layout.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("tcp_admin_token")?.value;

  if (!token) redirect("/login");

  return (
    <>
      <style>{`
        .dashboard-layout {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background-color: var(--bg-primary);
        }

        .dashboard-main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }

        .dashboard-content {
          flex: 1;
          overflow-y: auto;
          padding: 28px;
        }

        @media (max-width: 768px) {
          .dashboard-content {
            padding: 20px 16px;
            padding-top: 72px;
          }
        }
      `}</style>

      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-main-area">
          <TopBar />
          <main className="dashboard-content">{children}</main>
        </div>
      </div>
    </>
  );
}