import { Outlet, Link } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Placeholder */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:block">
        <div className="p-4 border-b border-slate-100">
          <h1 className="text-xl font-bold text-blue-600">KlinikKu</h1>
        </div>
        <nav className="p-4 space-y-2">
          <Link to="/admin" className="block p-2 rounded hover:bg-slate-50 text-slate-700">Pendaftaran</Link>
          <Link to="/dokter-umum" className="block p-2 rounded hover:bg-slate-50 text-slate-700">Poli Umum</Link>
          <Link to="/lab" className="block p-2 rounded hover:bg-slate-50 text-slate-700">Laboratorium</Link>
          <Link to="/radiologi" className="block p-2 rounded hover:bg-slate-50 text-slate-700">Radiologi</Link>
          <Link to="/dokter-spesialis" className="block p-2 rounded hover:bg-slate-50 text-slate-700">Poli Spesialis</Link>
          <Link to="/apotek" className="block p-2 rounded hover:bg-slate-50 text-slate-700">Apotek</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <h2 className="text-lg font-semibold text-slate-800">Dashboard</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-slate-600">User Profile</span>
          </div>
        </header>
        <div className="p-6 flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
