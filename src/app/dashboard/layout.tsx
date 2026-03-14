import { AuthProvider } from "@/components/providers/auth-provider";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-slate-100/60">
        <DashboardSidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <DashboardTopbar />
          <main className="flex-1 px-6 py-6">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
