import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 items-start max-w-7xl mx-auto w-full">
        <Sidebar />
        <main className="flex-1 p-6 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
