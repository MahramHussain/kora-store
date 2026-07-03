"use client";

import { useState, useEffect } from "react";
import { getUsers, updateUserBanStatus } from "../actions";
import { 
  FiSearch, 
  FiFilter, 
  FiUser, 
  FiShield, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiX, 
  FiClock, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCalendar, 
  FiShoppingBag,
  FiUserMinus
} from "react-icons/fi";

// Local Avatar component for standalone use
const UserAvatar = ({ 
  imageUrl, 
  name, 
  size = "w-10 h-10" 
}: { 
  imageUrl?: string | null; 
  name: string; 
  size?: string;
}) => {
  if (imageUrl) {
    return (
      <img 
        src={imageUrl} 
        alt={name} 
        className={`${size} rounded-full object-cover border border-slate-100 shadow-sm`}
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    );
  }
  const initials = name
    ? name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "V";

  return (
    <div className={`${size} rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs shadow-xs uppercase shrink-0`}>
      {initials || "U"}
    </div>
  );
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [banFilter, setBanFilter] = useState("all");
  
  // Selected user for details drawer
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Ban editing form states
  const [isBanned, setIsBanned] = useState(false);
  const [tempBanDuration, setTempBanDuration] = useState("none"); // none, 1day, 3days, 7days, 30days
  const [isShadowBanned, setIsShadowBanned] = useState(false);
  const [tempShadowDuration, setTempShadowDuration] = useState("none"); // none, 1day, 3days, 7days, 30days
  const [updatingBanId, setUpdatingBanId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await getUsers();
    setUsers(data);
    setLoading(false);
  };

  // Sync edit form when selected user changes
  useEffect(() => {
    if (selectedUser) {
      setIsBanned(selectedUser.isBanned);
      setIsShadowBanned(selectedUser.isShadowBanned);
      
      // Determine if temporary ban is active
      const now = new Date();
      if (selectedUser.bannedUntil && new Date(selectedUser.bannedUntil) > now) {
        setIsBanned(true);
      }
      if (selectedUser.shadowBanExpiresAt && new Date(selectedUser.shadowBanExpiresAt) > now) {
        setIsShadowBanned(true);
      }
      
      setTempBanDuration("none");
      setTempShadowDuration("none");
    }
  }, [selectedUser]);

  const handleUpdateBan = async (userId: string) => {
    setUpdatingBanId(userId);
    
    // Compute dates based on dropdown choices
    let bannedUntil: string | null = null;
    if (isBanned) {
      if (tempBanDuration !== "none") {
        const d = new Date();
        if (tempBanDuration === "1day") d.setDate(d.getDate() + 1);
        if (tempBanDuration === "3days") d.setDate(d.getDate() + 3);
        if (tempBanDuration === "7days") d.setDate(d.getDate() + 7);
        if (tempBanDuration === "30days") d.setDate(d.getDate() + 30);
        bannedUntil = d.toISOString();
      } else if (selectedUser?.bannedUntil && new Date(selectedUser.bannedUntil) > new Date()) {
        // Keep existing temporary ban if set
        bannedUntil = selectedUser.bannedUntil;
      }
    }

    let shadowBanExpiresAt: string | null = null;
    if (isShadowBanned) {
      if (tempShadowDuration !== "none") {
        const d = new Date();
        if (tempShadowDuration === "1day") d.setDate(d.getDate() + 1);
        if (tempShadowDuration === "3days") d.setDate(d.getDate() + 3);
        if (tempShadowDuration === "7days") d.setDate(d.getDate() + 7);
        if (tempShadowDuration === "30days") d.setDate(d.getDate() + 30);
        shadowBanExpiresAt = d.toISOString();
      } else if (selectedUser?.shadowBanExpiresAt && new Date(selectedUser.shadowBanExpiresAt) > new Date()) {
        // Keep existing temporary shadow ban if set
        shadowBanExpiresAt = selectedUser.shadowBanExpiresAt;
      }
    }

    const res = await updateUserBanStatus(userId, {
      isBanned: isBanned && tempBanDuration === "none" && !bannedUntil, // Only mark true perma ban if no temporal expires date
      bannedUntil,
      isShadowBanned: isShadowBanned && tempShadowDuration === "none" && !shadowBanExpiresAt,
      shadowBanExpiresAt,
    });

    if (res.success && res.user) {
      // Refresh list
      const updatedUsers = users.map(u => u.id === userId ? { 
        ...u, 
        isBanned: res.user.isBanned, 
        bannedUntil: res.user.bannedUntil,
        isShadowBanned: res.user.isShadowBanned,
        shadowBanExpiresAt: res.user.shadowBanExpiresAt
      } : u);
      setUsers(updatedUsers);
      
      // Update selected user view
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({
          ...selectedUser,
          isBanned: res.user.isBanned,
          bannedUntil: res.user.bannedUntil,
          isShadowBanned: res.user.isShadowBanned,
          shadowBanExpiresAt: res.user.shadowBanExpiresAt
        });
      }
      alert("User access permissions updated successfully.");
    } else {
      alert("Failed to update access permissions.");
    }
    setUpdatingBanId(null);
  };

  // Helper to test if temporary ban is currently active
  const checkTempBanActive = (userItem: any) => {
    if (!userItem.bannedUntil) return false;
    return new Date(userItem.bannedUntil) > new Date();
  };

  const checkTempShadowActive = (userItem: any) => {
    if (!userItem.shadowBanExpiresAt) return false;
    return new Date(userItem.shadowBanExpiresAt) > new Date();
  };

  // Filtered Users computation
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
    const email = (u.email || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = fullName.includes(query) || email.includes(query);
    
    // Gender Filter
    let matchesGender = true;
    if (genderFilter === "Male") matchesGender = u.gender === "Male";
    else if (genderFilter === "Female") matchesGender = u.gender === "Female";
    else if (genderFilter === "Other") matchesGender = u.gender === "Other";
    else if (genderFilter === "unspecified") matchesGender = !u.gender;

    // Ban status Filter
    let matchesBan = true;
    const isCurrentlyBanned = u.isBanned || checkTempBanActive(u);
    const isCurrentlyShadow = u.isShadowBanned || checkTempShadowActive(u);
    
    if (banFilter === "banned") matchesBan = isCurrentlyBanned;
    else if (banFilter === "shadow-banned") matchesBan = isCurrentlyShadow;
    else if (banFilter === "active") matchesBan = !isCurrentlyBanned && !isCurrentlyShadow;

    return matchesSearch && matchesGender && matchesBan;
  });

  // Overview stats computation
  const totalCount = users.length;
  const bannedCount = users.filter(u => u.isBanned || checkTempBanActive(u)).length;
  const shadowBannedCount = users.filter(u => u.isShadowBanned || checkTempShadowActive(u)).length;
  const activeCount = totalCount - bannedCount - shadowBannedCount;

  return (
    <div className="space-y-6">
      {/* ═══ Stats Cards Grid ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Members</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900 leading-none">{totalCount}</span>
            <span className="text-xs font-semibold text-slate-400">accounts</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Active Members</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-emerald-600 leading-none">{activeCount}</span>
            <span className="text-xs font-semibold text-slate-400">verified</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Restricted (Banned)</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-rose-500 leading-none">{bannedCount}</span>
            <span className="text-xs font-semibold text-slate-400">banned</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Shadow Banned</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-amber-500 leading-none">{shadowBannedCount}</span>
            <span className="text-xs font-semibold text-slate-400">hidden</span>
          </div>
        </div>
      </div>

      {/* ═══ Filtering & Table Container ═══ */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-6 shadow-sm">
        
        {/* Filter bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-4 top-3.5 text-slate-400 text-base" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-kora focus:ring-1 focus:ring-kora"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Gender filter */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-2xl">
              <FiFilter className="text-slate-400 text-sm" />
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="unspecified">Unspecified</option>
              </select>
            </div>

            {/* Ban Status filter */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-2xl">
              <FiShield className="text-slate-400 text-sm" />
              <select
                value={banFilter}
                onChange={(e) => setBanFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="all">All Accounts</option>
                <option value="active">Active Accounts</option>
                <option value="banned">Banned</option>
                <option value="shadow-banned">Shadow Banned</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table / List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-10 h-10 mb-4">
              <div className="absolute inset-0 rounded-full border-[3px] border-slate-100" />
              <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-kora animate-spin" />
            </div>
            <p className="text-xs text-slate-400 uppercase font-black tracking-widest">Loading Users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <p className="text-sm text-slate-400 italic">No user accounts found matching selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-[10px] font-black uppercase text-slate-400 tracking-wider pl-4">Member</th>
                  <th className="pb-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">Email Address</th>
                  <th className="pb-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">Gender</th>
                  <th className="pb-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">Status</th>
                  <th className="pb-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">Join Date</th>
                  <th className="pb-3 text-[10px] font-black uppercase text-slate-400 tracking-wider pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((u) => {
                  const isCurrentBanned = u.isBanned || checkTempBanActive(u);
                  const isCurrentShadow = u.isShadowBanned || checkTempShadowActive(u);
                  const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Vault Member";
                  
                  return (
                    <tr 
                      key={u.id} 
                      onClick={() => setSelectedUser(u)}
                      className={`hover:bg-slate-50/70 transition-all cursor-pointer group ${
                        selectedUser?.id === u.id ? "bg-slate-50" : ""
                      }`}
                    >
                      <td className="py-4 pl-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar imageUrl={u.imageUrl || u.customProfilePic} name={fullName} />
                          <div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-kora transition-colors">{fullName}</p>
                            <p className="text-[10px] font-mono text-slate-400">{u.id.substring(0, 14)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-semibold text-slate-600">{u.email}</td>
                      <td className="py-4">
                        {u.gender ? (
                          <span className="inline-flex text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {u.gender}
                          </span>
                        ) : (
                          <span className="inline-flex text-[10px] font-semibold italic text-slate-400">
                            Unspecified
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        {isCurrentBanned ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                            <FiUserMinus className="text-[10px]" /> Banned
                          </span>
                        ) : isCurrentShadow ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
                            <FiAlertTriangle className="text-[10px]" /> Shadow Banned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                            <FiCheckCircle className="text-[10px]" /> Active
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-xs font-semibold text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <button className="text-xs font-bold uppercase text-slate-400 group-hover:text-kora underline transition-colors">
                          Manage &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══ Details & Ban Control Side Drawer / Overlay Modal ═══ */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex justify-end animate-fade-in">
          
          {/* Backdrop Click Dismiss */}
          <div className="absolute inset-0" onClick={() => setSelectedUser(null)} />

          {/* Drawer Content */}
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto p-6 sm:p-8 flex flex-col justify-between animate-slide-in-right z-10 font-sans">
            
            {/* Header info */}
            <div className="space-y-6">
              
              {/* Drawer Top Row */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black uppercase text-slate-900 tracking-wide">User Account Profile</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Resolved contact information and access logs.</p>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              {/* User Avatar & Identity Card */}
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-3xl">
                <UserAvatar 
                  imageUrl={selectedUser.imageUrl || selectedUser.customProfilePic} 
                  name={`${selectedUser.firstName || ""} ${selectedUser.lastName || ""}`} 
                  size="w-16 h-16" 
                />
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">
                    {selectedUser.firstName || ""} {selectedUser.lastName || ""}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedUser.id}</p>
                  <div className="flex gap-2 mt-2">
                    {selectedUser.gender ? (
                      <span className="text-[10px] font-bold bg-slate-200/60 text-slate-700 px-2 py-0.5 rounded">
                        {selectedUser.gender}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-slate-200/30 text-slate-400 italic px-2 py-0.5 rounded">
                        Gender unspecified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* resolved profile data */}
              <div className="space-y-3.5">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Profile Intel</h5>
                
                <div className="flex items-center gap-3 text-slate-600">
                  <FiMail className="text-slate-400 shrink-0 text-base" />
                  <div className="text-xs">
                    <p className="text-slate-400 font-bold text-[9px] uppercase leading-none">Email Address</p>
                    <p className="font-semibold text-slate-800 mt-1">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-600">
                  <FiPhone className="text-slate-400 shrink-0 text-base" />
                  <div className="text-xs">
                    <p className="text-slate-400 font-bold text-[9px] uppercase leading-none">Contact Number</p>
                    <p className="font-semibold text-slate-800 mt-1">{selectedUser.phone || "No direct phone config"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-600">
                  <FiMapPin className="text-slate-400 shrink-0 text-base" />
                  <div className="text-xs">
                    <p className="text-slate-400 font-bold text-[9px] uppercase leading-none">Resolved Location</p>
                    <p className="font-semibold text-slate-800 mt-1">{selectedUser.location || "No registered address"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-600">
                  <FiCalendar className="text-slate-400 shrink-0 text-base" />
                  <div className="text-xs">
                    <p className="text-slate-400 font-bold text-[9px] uppercase leading-none">Registration Date</p>
                    <p className="font-semibold text-slate-800 mt-1">
                      {new Date(selectedUser.createdAt).toLocaleDateString()} at {new Date(selectedUser.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order History Summary */}
              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Order History ({selectedUser.orders?.length || 0})</h5>
                {selectedUser.orders && selectedUser.orders.length > 0 ? (
                  <div className="max-h-36 overflow-y-auto space-y-2.5 pr-2">
                    {selectedUser.orders.map((o: any) => (
                      <div key={o.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-2xl text-xs">
                        <div>
                          <p className="font-bold text-slate-800 flex items-center gap-1.5">
                            <FiShoppingBag className="text-slate-400" />
                            <span>AED {parseFloat(o.total).toFixed(2)}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{new Date(o.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          o.status === "Delivered" ? "bg-emerald-50 text-emerald-600" :
                          o.status === "Shipped" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                        }`}>
                          {o.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No checkout order history recorded.</p>
                )}
              </div>

              {/* Ban / Access Controls section */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 space-y-4">
                <h5 className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                  <FiShield className="text-slate-900" />
                  <span>Access Permission Controls</span>
                </h5>

                {/* Permanent / Temporary Ban options */}
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={isBanned}
                      onChange={(e) => {
                        setIsBanned(e.target.checked);
                        if (!e.target.checked) setTempBanDuration("none");
                      }}
                      className="accent-kora w-4 h-4 rounded"
                    />
                    <span className="text-xs font-bold text-slate-800">Restrict / Ban user from site</span>
                  </label>

                  {isBanned && (
                    <div className="pl-6 animate-fade-in">
                      <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Ban Duration</p>
                      <select
                        value={tempBanDuration}
                        onChange={(e) => setTempBanDuration(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none bg-white"
                      >
                        <option value="none">Permanent ban (until manually unbanned)</option>
                        <option value="1day">Temporary: 24 Hours</option>
                        <option value="3days">Temporary: 3 Days</option>
                        <option value="7days">Temporary: 7 Days</option>
                        <option value="30days">Temporary: 30 Days</option>
                      </select>
                      
                      {selectedUser.bannedUntil && new Date(selectedUser.bannedUntil) > new Date() && (
                        <p className="text-[10px] text-rose-500 font-semibold mt-2.5 flex items-center gap-1.5">
                          <FiClock /> Active temporary ban until {new Date(selectedUser.bannedUntil).toLocaleDateString()} {new Date(selectedUser.bannedUntil).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="h-px bg-slate-200" />

                {/* Shadow Ban options */}
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={isShadowBanned}
                      onChange={(e) => {
                        setIsShadowBanned(e.target.checked);
                        if (!e.target.checked) setTempShadowDuration("none");
                      }}
                      className="accent-kora w-4 h-4 rounded"
                    />
                    <span className="text-xs font-bold text-slate-800">Shadow Ban user (hide reviews/activity)</span>
                  </label>

                  {isShadowBanned && (
                    <div className="pl-6 animate-fade-in">
                      <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Shadow Ban Duration</p>
                      <select
                        value={tempShadowDuration}
                        onChange={(e) => setTempShadowDuration(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none bg-white"
                      >
                        <option value="none">Permanent shadow ban (until manually unbanned)</option>
                        <option value="1day">Temporary: 24 Hours</option>
                        <option value="3days">Temporary: 3 Days</option>
                        <option value="7days">Temporary: 7 Days</option>
                        <option value="30days">Temporary: 30 Days</option>
                      </select>
                      
                      {selectedUser.shadowBanExpiresAt && new Date(selectedUser.shadowBanExpiresAt) > new Date() && (
                        <p className="text-[10px] text-amber-500 font-semibold mt-2.5 flex items-center gap-1.5">
                          <FiClock /> Active shadow ban until {new Date(selectedUser.shadowBanExpiresAt).toLocaleDateString()} {new Date(selectedUser.shadowBanExpiresAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Footer Update action */}
            <div className="border-t border-slate-100 pt-5 mt-6">
              <button
                onClick={() => handleUpdateBan(selectedUser.id)}
                disabled={updatingBanId !== null}
                className="w-full bg-slate-900 hover:bg-kora text-white text-xs font-bold uppercase py-3.5 rounded-2xl tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              >
                {updatingBanId === selectedUser.id ? "Updating Vault Access..." : "Update Vault Access"}
              </button>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
