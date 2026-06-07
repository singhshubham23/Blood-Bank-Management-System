import React, { useContext, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import DigitalCard from "../components/DigitalCard";
import api from "../api/axios";
import { 
  Droplet, 
  HeartPulse, 
  CheckCircle, 
  Award, 
  Plus, 
  FileText, 
  Check, 
  MapPin, 
  User, 
  History, 
  ArrowRight, 
  Activity 
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

/* ── Helpers ── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

/* ── Custom Chart Tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 border border-slate-800 rounded-xl p-3 shadow-2xl backdrop-blur-md">
        <p className="text-[0.62rem] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
        {payload.map((p, idx) => (
          <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold py-0.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-slate-300 text-[0.7rem]">{p.name}:</span>
            <span className="text-white ml-auto font-bold">{p.value} units</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/* ── Metric Card ── */
function MetricCard({ icon: Icon, value, label, change, colorClass, gradient }) {
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-200/80 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
      {/* Glow effect on hover */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-300 pointer-events-none blur-xl`} />
      
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            {label}
          </span>
          <div className="text-3xl font-black text-slate-900 tracking-tight leading-none">
            {value}
          </div>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5">
        <span className="text-[0.68rem] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
          {change}
        </span>
      </div>
    </div>
  );
}

/* ── Task Row ── */
function TaskRow({ to, title, meta, icon: Icon, done }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/50 hover:border-slate-200/60 active:translate-y-px transition-all duration-200 no-underline group"
    >
      <div
        className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-200 ${
          done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 group-hover:border-rose-300"
        }`}
      >
        {done && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-slate-900 leading-snug">{title}</div>
        <div className="text-[0.68rem] text-slate-400 mt-0.5">{meta}</div>
      </div>
      <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover:text-rose-500 group-hover:bg-rose-50 transition-colors">
        <Icon className="w-4 h-4" />
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ donations: 0, activeRequests: 0, completed: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [txRes, reqRes] = await Promise.all([
        api.get(`/transactions/user/${user._id || user.id}`).catch(() => ({ data: [] })),
        api.get("/requests/my").catch(() => ({ data: { requests: [] } })),
      ]);
      const txs = txRes.data || [];
      const reqs = reqRes.data?.requests || reqRes.data || [];

      const donations = txs.reduce((sum, t) => {
        const isDonation = t.type === "IN" || t.type === "DONATION";
        return isDonation ? sum + Number(t.units || 0) : sum;
      }, 0);
      const activeRequests = reqs.filter((r) => r.status === "PENDING").length;
      const completed = reqs.filter((r) => r.status === "APPROVED" || r.status === "COMPLETED").length;

      setStats({ donations, activeRequests, completed });

      // Group transactions by month for the last 6 months
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const last6Months = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        last6Months.push({
          monthName: months[d.getMonth()],
          year: d.getFullYear(),
          monthIndex: d.getMonth(),
          donations: 0,
          requests: 0,
        });
      }

      txs.forEach((t) => {
        const date = new Date(t.timestamp || t.createdAt);
        if (isNaN(date.getTime())) return;
        const txMonth = date.getMonth();
        const txYear = date.getFullYear();

        const match = last6Months.find((m) => m.monthIndex === txMonth && m.year === txYear);
        if (match) {
          const isDonation = t.type === "IN" || t.type === "DONATION";
          const units = Number(t.units || 0);
          if (isDonation) {
            match.donations += units;
          } else {
            match.requests += units;
          }
        }
      });

      const formattedChart = last6Months.map((m) => ({
        name: m.monthName,
        Donations: m.donations,
        Requests: m.requests,
      }));

      setChartData(formattedChart);
    } catch {
      /* keep defaults */
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const firstName = user?.name?.split(" ")[0] || "User";
  const val = (v) => (loading ? "…" : v);

  const isChartEmpty = chartData.length === 0 || chartData.every(d => d.Donations === 0 && d.Requests === 0);

  return (
    <div className="px-6 py-8 md:px-9 md:py-8 max-w-[1100px] animate-[fadeSlideIn_0.4s_ease]">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-[0.68rem] font-bold text-rose-500 uppercase tracking-[2px] mb-1">
            {getGreeting()}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
              {firstName}
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Manage your blood donations and active requests from your command center.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/create-request"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/10 hover:shadow-lg hover:shadow-red-500/20 active:translate-y-px transition-all duration-200 no-underline cursor-pointer border-0"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            New Request
          </Link>
          <Link
            to="/requests"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 hover:text-red-500 active:translate-y-px transition-all duration-200 no-underline cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            My Requests
          </Link>
        </div>
      </div>

      {/* ── Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard 
          icon={Droplet} 
          value={val(stats.donations)} 
          label="Total Donations" 
          change="↑ units donated" 
          colorClass="bg-rose-50 text-rose-600"
          gradient="from-rose-500 to-red-600"
        />
        <MetricCard 
          icon={HeartPulse} 
          value={val(stats.activeRequests)} 
          label="Active Requests" 
          change="Pending verification" 
          colorClass="bg-orange-50 text-orange-600"
          gradient="from-orange-400 to-amber-500"
        />
        <MetricCard 
          icon={CheckCircle} 
          value={val(stats.completed)} 
          label="Completed" 
          change="Approved & closed" 
          colorClass="bg-emerald-50 text-emerald-600"
          gradient="from-emerald-400 to-teal-500"
        />
        <MetricCard 
          icon={Award} 
          value={val(Math.floor(stats.donations / 5))} 
          label="Free Units Earned" 
          change="Every 5 donations = 1 free" 
          colorClass="bg-amber-50 text-amber-600"
          gradient="from-amber-400 to-yellow-500"
        />
      </div>

      {/* ── Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Chart Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100/80 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Donation & Request Activity</h3>
              <p className="text-[0.68rem] text-slate-400 mt-0.5">Summary of units processed over the last 6 months</p>
            </div>
            <Link to="/transactions" className="flex items-center gap-1 text-xs text-rose-500 font-bold hover:text-rose-600 no-underline transition-colors">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          {/* Recharts AreaChart with Fallback Empty State */}
          <div className="h-64 relative w-full flex items-center justify-center">
            {isChartEmpty && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] rounded-xl z-10 flex flex-col items-center justify-center text-center p-4">
                <div className="w-11 h-11 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-2">
                  <Activity className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700">No Activity Yet</p>
                <p className="text-[0.68rem] text-slate-400 max-w-xs mt-1">Your blood donation trends will appear here once you record your first contribution or request.</p>
              </div>
            )}
            
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={isChartEmpty ? [
                  { name: "Month 1", Donations: 1, Requests: 0 },
                  { name: "Month 2", Donations: 0, Requests: 2 },
                  { name: "Month 3", Donations: 2, Requests: 1 },
                  { name: "Month 4", Donations: 1, Requests: 3 },
                  { name: "Month 5", Donations: 3, Requests: 1 },
                  { name: "Month 6", Donations: 2, Requests: 2 }
                ] : chartData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="Donations" 
                  stroke="#ef4444" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorDonations)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="Requests" 
                  stroke="#f97316" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRequests)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100/80 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Actions</h3>
              <p className="text-[0.68rem] text-slate-400 mt-0.5">Tasks and shortcuts for your account</p>
            </div>
            <Link to="/nearby-help" className="flex items-center gap-1 text-xs text-rose-500 font-bold hover:text-rose-600 no-underline transition-colors">
              Find Help <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <TaskRow to="/create-request" title="Create a blood request" meta="Request blood from nearby centres" icon={Plus} />
            <TaskRow to="/profile" title="Complete your profile" meta="Add blood group & contact info" icon={User} />
            <TaskRow to="/nearby-help" title="Find nearby blood banks" meta="Locate centres close to you" icon={MapPin} />
            <TaskRow to="/transactions" title="Review transaction history" meta="Track past donations & requests" icon={History} done />
          </div>
        </div>
      </div>

      {/* ── Digital Donor Card Section ── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100/80 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Digital Donor Pass</h3>
            <p className="text-[0.68rem] text-slate-400 mt-0.5 font-medium">Official digital certificate of your donor contributions</p>
          </div>
          <Link to="/profile" className="flex items-center gap-1 text-xs text-rose-500 font-bold hover:text-rose-600 no-underline transition-colors">
            Edit Profile <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <DigitalCard />
      </div>
    </div>
  );
}