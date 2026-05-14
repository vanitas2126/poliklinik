import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login for now, redirect to admin dashboard
    navigate("/admin");
  };

  return (
    <div className="card w-full max-w-md">
      <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Login Sistem</h2>
      <form className="space-y-4" onSubmit={handleLogin}>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input type="email" className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Masukan Email" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input type="password" className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Masukan Password" required />
        </div>
        <button type="submit" className="btn-primary w-full">Login</button>
      </form>
    </div>
  );
}
