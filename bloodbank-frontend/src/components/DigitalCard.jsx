import React, { useContext, useRef, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function DigitalCard() {
  const { user } = useContext(AuthContext);
  const cardRef = useRef();
  const [totalDonated, setTotalDonated] = useState(0);
  const [loadingTotals, setLoadingTotals] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoadingTotals(false);
      return;
    }
    if (user.role && user.role !== "user") {
      setLoadingTotals(false);
      return;
    }
    setLoadingTotals(true);
    setLoadError("");
    api
      .get(`/transactions/user/${user._id || user.id}`)
      .then((res) => {
        const txs = res.data || [];
        const donated = txs.reduce((sum, t) => {
          const isDonation = t.type === "IN" || t.type === "DONATION";
          return isDonation ? sum + Number(t.units || 0) : sum;
        }, 0);
        setTotalDonated(donated);
      })
      .catch(() => {
        setLoadError("Failed to load donation totals.");
      })
      .finally(() => setLoadingTotals(false));
  }, [user]);

  if (!user) return <p className="text-center py-5 text-slate-400">Loading profile...</p>;
  
  if (user.role && user.role !== "user") {
    return (
      <div className="text-center py-8 bg-slate-50 border border-slate-100 rounded-2xl p-6">
        <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h5 className="text-slate-900 font-bold mb-1">Donor Card Unavailable</h5>
        <p className="text-slate-400 text-xs max-w-xs mx-auto">
          Digital donor passes are only generated for user accounts enrolled in the donor network.
        </p>
      </div>
    );
  }

  const eligibleForCard = totalDonated >= 5;
  const freeUnitsEarned = Math.floor(totalDonated / 5);

  const downloadPDF = async () => {
    const element = cardRef.current;
    try {
      const canvas = await html2canvas(element, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("portrait", "px", [430, 600]);
      pdf.addImage(imgData, "PNG", 0, 0, 430, 600);
      pdf.save("Digital_Blood_Donor_Card.pdf");
    } catch (err) {
      console.error("Failed to generate PDF", err);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {loadingTotals ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500" />
          <p className="text-slate-400 text-xs mt-2 font-medium">Synchronizing donor pass...</p>
        </div>
      ) : loadError ? (
        <div className="w-full text-center py-4 px-5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
          {loadError}
        </div>
      ) : !eligibleForCard ? (
        <div className="w-full max-w-[430px] bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div>
              <h5 className="font-bold text-slate-900 mb-0.5 text-sm">Digital Donor Card Locked</h5>
              <p className="text-xs text-slate-400">Unlock your certified pass at 5 donations</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Unlock Progress</span>
              <span className="font-bold text-rose-600">{totalDonated} / 5 Units</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-rose-600 rounded-full transition-all duration-500" 
                style={{ width: `${(totalDonated / 5) * 100}%` }}
              />
            </div>

            <div className="text-xs leading-relaxed text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              Donate <strong>{5 - totalDonated}</strong> more unit{5 - totalDonated === 1 ? "" : "s"} to claim your secure, shareable Digital Donor Card and earn reward points.
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-[430px] flex flex-col items-center">
          {/* ---- CAPTURABLE CARD CONTAINER ---- */}
          <div className="w-full overflow-hidden rounded-3xl shadow-xl border border-slate-200/50 scale-[0.9] sm:scale-100 origin-top h-[540px] sm:h-[600px] w-[430px] flex shrink-0">
            <div
              ref={cardRef}
              className="w-[430px] h-[600px] text-white p-8 relative flex flex-col justify-between bg-gradient-to-br from-[#1c0205] via-[#5f0918] to-[#0d131f] overflow-hidden select-none shrink-0"
              style={{
                fontFamily: "'Inter', sans-serif"
              }}
            >
              {/* Floating watermark */}
              <div className="absolute -right-12 -bottom-12 text-red-600/10 pointer-events-none">
                <svg width="280" height="280" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </div>

              {/* Shimmer overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,rgba(255,255,255,0.03)_50%,transparent_55%)] bg-[length:200%_200%] animate-[shimmer_8s_infinite_linear] pointer-events-none" />

              {/* Card Header */}
              <div className="flex justify-between items-start z-10">
                <div>
                  <div className="text-[0.65rem] font-bold tracking-[3px] text-rose-400 uppercase">BloodBank Pass</div>
                  <div className="text-lg font-extrabold tracking-tight text-white mt-0.5">DONOR RECORD</div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-[0.6rem] font-bold tracking-[1.5px] text-slate-400 uppercase">Blood Group</div>
                  <div className="mt-1 bg-red-600/90 text-white font-black text-xl px-3 py-1 rounded-xl shadow-lg border border-red-500/30">
                    {user.bloodGroup || "O+"}
                  </div>
                </div>
              </div>

              {/* Chip & Wireless Symbol */}
              <div className="flex justify-between items-center z-10">
                {/* Chip */}
                <div className="w-12 h-9 rounded-md bg-gradient-to-br from-amber-300 via-yellow-100 to-amber-500 p-1 flex flex-col justify-between shadow-md border border-amber-400/20">
                  <div className="flex justify-between h-full w-full">
                    <div className="border-r border-amber-800/10 w-1/3 h-full" />
                    <div className="border-r border-amber-800/10 w-1/3 h-full" />
                  </div>
                </div>
                {/* Wireless indicator */}
                <div className="text-white/30">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.8 13.8a4.5 4.5 0 0 1 6.4 0" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 11a8.5 8.5 0 0 1 12 0" />
                  </svg>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-y-5 gap-x-6 z-10">
                <div>
                  <div className="text-[0.62rem] font-bold text-slate-400 uppercase tracking-wider">Donor Name</div>
                  <div className="text-sm font-bold truncate mt-0.5 text-white">{user.name || "Not Provided"}</div>
                </div>
                <div>
                  <div className="text-[0.62rem] font-bold text-slate-400 uppercase tracking-wider">Donor ID</div>
                  <div className="text-sm font-mono truncate mt-0.5 text-rose-300">{user.uniqueId || "Not Provided"}</div>
                </div>
                <div>
                  <div className="text-[0.62rem] font-bold text-slate-400 uppercase tracking-wider">Contact Phone</div>
                  <div className="text-sm font-bold truncate mt-0.5 text-white">{user.phone || "Not Provided"}</div>
                </div>
                <div>
                  <div className="text-[0.62rem] font-bold text-slate-400 uppercase tracking-wider">Location</div>
                  <div className="text-sm font-bold truncate mt-0.5 text-white">{user.location || "Not Provided"}</div>
                </div>
                <div>
                  <div className="text-[0.62rem] font-bold text-slate-400 uppercase tracking-wider">Total Donated</div>
                  <div className="text-sm font-bold mt-0.5 text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    {totalDonated} unit{totalDonated === 1 ? "" : "s"}
                  </div>
                </div>
                <div>
                  <div className="text-[0.62rem] font-bold text-slate-400 uppercase tracking-wider">Free Rewards</div>
                  <div className="text-sm font-bold mt-0.5 text-amber-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse" />
                    {freeUnitsEarned} unit{freeUnitsEarned === 1 ? "" : "s"}
                  </div>
                </div>
              </div>

              {/* Footer / Barcode */}
              <div className="border-t border-white/10 pt-5 flex flex-col items-center gap-3.5 z-10">
                <div className="w-full flex flex-col items-center gap-1">
                  {/* Barcode representation */}
                  <div className="flex items-center gap-[2.5px] h-7 bg-white/10 px-3 py-1 rounded w-full justify-center">
                    {Array.from({ length: 42 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="bg-white/70 h-full shrink-0"
                        style={{ width: idx % 4 === 0 ? "1px" : idx % 7 === 0 ? "3px" : "2px" }}
                      />
                    ))}
                  </div>
                  <div className="text-[0.55rem] font-mono tracking-[4px] text-slate-400">
                    *BB-{user.uniqueId ? user.uniqueId.substring(0, 8).toUpperCase() : "DONOR"}*
                  </div>
                </div>
                <div className="text-[0.62rem] text-slate-400 text-center tracking-wide font-medium">
                  Thank you for saving lives • Certified Donor Pass
                </div>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={downloadPDF}
            className="w-full mt-4 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 active:translate-y-px transition-all duration-200 shadow-md cursor-pointer border border-slate-800"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download Digital Pass (PDF)
          </button>
        </div>
      )}
    </div>
  );
}
