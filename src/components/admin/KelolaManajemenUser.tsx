import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../../types';
import { useRealtimeSync } from '../../lib/useRealtimeSync';
import {
  dbFetchUsers,
  dbInsertUser,
  dbUpdateUser,
  dbDeleteUser,
  generateUUID
} from '../../lib/supabaseClient';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Mail,
  User,
  Key,
  BadgeCheck,
  Power,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface KelolaManajemenUserProps {
  currentUser: UserProfile;
}

export const KelolaManajemenUser: React.FC<KelolaManajemenUserProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserProfile | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [namaLengkap, setNamaLengkap] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('staff_desa');
  const [jabatan, setJabatan] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');

  useEffect(() => {
    loadUsers();
  }, []);

  useRealtimeSync('profiles', (evt) => {
    loadUsers();
    if (evt.source === 'remote') {
      showToast('⚡ Data akun pengguna diperbarui dari komputer lain!');
    }
  });

  const loadUsers = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await dbFetchUsers();
      setUsers(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat pengguna dari database');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setNamaLengkap('');
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('staff_desa');
    setJabatan('');
    setStatus('Aktif');
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleOpenEdit = (u: UserProfile) => {
    setEditingUser(u);
    setNamaLengkap(u.nama_lengkap);
    setUsername(u.username || '');
    setEmail(u.email);
    setPassword(u.password || '');
    setRole(u.role);
    setJabatan(u.jabatan || '');
    setStatus(u.status || 'Aktif');
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap.trim() || !username.trim() || !email.trim()) {
      alert('Nama lengkap, username, dan email wajib diisi!');
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_');
    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate username or email among others
    const duplicate = users.find(
      (u) =>
        u.id !== editingUser?.id &&
        (u.username?.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail)
    );

    if (duplicate) {
      alert('Username atau email tersebut sudah digunakan pengguna lain!');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      if (editingUser) {
        const updatePayload: UserProfile = {
          ...editingUser,
          nama_lengkap: namaLengkap.trim(),
          username: cleanUsername,
          email: cleanEmail,
          password: password.trim() || editingUser.password || '123456',
          role,
          jabatan: jabatan.trim() || (role === 'staff_desa' ? 'Staf Pelayanan' : 'Kontributor Berita'),
          status,
        };

        const res = await dbUpdateUser(updatePayload);
        if (!res.success) {
          alert(`Gagal menyimpan ke database Supabase: ${res.error}`);
          setSaving(false);
          return;
        }

        await loadUsers();
        showToast(`Data pengguna "${namaLengkap}" berhasil diperbarui di database.`);
      } else {
        const baru: UserProfile = {
          id: generateUUID(),
          nama_lengkap: namaLengkap.trim(),
          username: cleanUsername,
          email: cleanEmail,
          password: password.trim() || '123456',
          role,
          jabatan: jabatan.trim() || (role === 'staff_desa' ? 'Staf Administrasi' : 'Kontributor Berita'),
          status,
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&fit=crop&q=80',
          created_at: new Date().toISOString(),
        };

        const res = await dbInsertUser(baru);
        if (!res.success) {
          alert(`Gagal mengirim user baru ke database Supabase: ${res.error}`);
          setSaving(false);
          return;
        }

        await loadUsers();
        showToast(`User baru "${namaLengkap}" berhasil tersimpan ke database Supabase.`);
      }
      setShowModal(false);
    } catch (err: any) {
      alert(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (u: UserProfile) => {
    if (u.id === currentUser.id) {
      alert('Anda tidak dapat menonaktifkan akun sendiri yang sedang aktif.');
      return;
    }
    const newStatus = u.status === 'Nonaktif' ? 'Aktif' : 'Nonaktif';
    const res = await dbUpdateUser({ ...u, status: newStatus });
    if (!res.success) {
      alert(`Gagal memperbarui status user di database: ${res.error}`);
      return;
    }
    await loadUsers();
    showToast(`Status user ${u.nama_lengkap} diubah menjadi ${newStatus}.`);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    if (confirmDelete.id === currentUser.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri!');
      setConfirmDelete(null);
      return;
    }

    const res = await dbDeleteUser(confirmDelete.id);
    if (!res.success) {
      alert(`Gagal menghapus user dari database: ${res.error}`);
      setConfirmDelete(null);
      return;
    }

    setConfirmDelete(null);
    await loadUsers();
    showToast('Pengguna berhasil dihapus dari database Supabase.');
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.jabatan && u.jabatan.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="p-4 bg-[#0D2A4A] text-white rounded-2xl shadow-lg border border-blue-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#FFB300]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header & Aksi Tambah */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-[#0D2A4A] font-heading flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1565C0]" />
            <span>Manajemen User (Staf Desa & Kontributor)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Terkoneksi langsung ke tabel Supabase <code className="px-1.5 py-0.5 bg-slate-100 rounded text-blue-700 font-mono text-[11px]">profiles</code> secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadUsers}
            disabled={loading}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="Muat ulang dari database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#1565C0]' : ''}`} />
            <span>Sinkron DB</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-[#1565C0] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#FFB300]" />
            <span>Tambah Pengguna Baru</span>
          </button>
        </div>
      </div>

      {/* Info Card Akses Hak Peran */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-start gap-3">
          <div className="p-2 bg-blue-100 text-[#1565C0] rounded-xl shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-blue-950">Peran: Staf Desa (Staff Pelayanan)</div>
            <div className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
              Memiliki wewenang memproses permohonan surat warga, buku register naskah dinas, master syarat, statistik APBDes, produk hukum desa, serta manajemen user.
            </div>
          </div>
        </div>

        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-3">
          <div className="p-2 bg-emerald-100 text-[#2E7D32] rounded-xl shrink-0">
            <BadgeCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-950">Peran: Kontributor Berita (User Biasa)</div>
            <div className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
              Dapat login melalui portal untuk menulis dan mengirim artikel berita, kegiatan warga, serta liputan dusun langsung ke portal desa.
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Pencarian */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nama, username, email, atau jabatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1565C0] outline-none"
          />
        </div>

        <div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as 'all' | UserRole)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1565C0] outline-none"
          >
            <option value="all">Semua Peran User ({users.length})</option>
            <option value="staff_desa">
              Staf Desa ({users.filter((u) => u.role === 'staff_desa').length})
            </option>
            <option value="user_biasa">
              Kontributor Berita ({users.filter((u) => u.role === 'user_biasa').length})
            </option>
          </select>
        </div>
      </div>

      {/* Tabel Daftar Pengguna */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="p-3.5">Pengguna & Akun</th>
                <th className="p-3.5">Peran / Hak Akses</th>
                <th className="p-3.5">Jabatan / Posisi</th>
                <th className="p-3.5">Status Akun</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Tidak ada pengguna yang cocok dengan kriteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            u.role === 'staff_desa'
                              ? 'bg-blue-100 text-[#1565C0]'
                              : 'bg-emerald-100 text-[#2E7D32]'
                          }`}
                        >
                          {u.nama_lengkap.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{u.nama_lengkap}</span>
                            {u.id === currentUser.id && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-md font-bold">
                                Anda
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                            <span>@{u.username || 'user'}</span>
                            <span>•</span>
                            <span>{u.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      {u.role === 'staff_desa' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-[#1565C0] border border-blue-200">
                          <Shield className="w-3 h-3" />
                          <span>Staf Desa</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-[#2E7D32] border border-emerald-200">
                          <BadgeCheck className="w-3 h-3" />
                          <span>Kontributor Berita</span>
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <span className="font-medium text-slate-700">{u.jabatan || '-'}</span>
                    </td>

                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u)}
                        disabled={u.id === currentUser.id}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                          u.status === 'Nonaktif'
                            ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        } ${u.id === currentUser.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                        title={u.id === currentUser.id ? 'Akun aktif milik sendiri' : 'Klik untuk ganti status'}
                      >
                        <Power className="w-2.5 h-2.5" />
                        <span>{u.status === 'Nonaktif' ? 'Nonaktif' : 'Aktif'}</span>
                      </button>
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="px-2.5 py-1 bg-blue-50 text-[#1565C0] hover:bg-blue-100 rounded-lg font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          disabled={u.id === currentUser.id}
                          onClick={() => setConfirmDelete(u)}
                          className={`p-1 rounded-lg transition-colors ${
                            u.id === currentUser.id
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-rose-600 hover:bg-rose-50 cursor-pointer'
                          }`}
                          title={u.id === currentUser.id ? 'Tidak bisa menghapus akun sendiri' : 'Hapus user'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM TAMBAH / EDIT USER */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#1565C0]" />
                <h3 className="font-heading font-bold text-base text-[#0D2A4A]">
                  {editingUser ? 'Sunting Data Pengguna' : 'Tambah Pengguna Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nama Lengkap Pengguna *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso, S.Sos"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#1565C0] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Username Login *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: budi_staf"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#1565C0] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Email Resmi *</label>
                  <input
                    type="email"
                    required
                    placeholder="budi@nyurlembang.desa.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#1565C0] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Password Login {editingUser ? '(Kosongkan jika tidak diganti)' : '*'}
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required={!editingUser}
                    placeholder={editingUser ? 'Biarkan kosong untuk password lama' : 'Password login user'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#1565C0] outline-none font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  User dapat login menggunakan Username/Email beserta password ini pada jendela login.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Peran / Hak Akses *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#1565C0] outline-none"
                  >
                    <option value="staff_desa">Staf Pelayanan Desa</option>
                    <option value="user_biasa">Kontributor Berita Desa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Status Akun</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Aktif' | 'Nonaktif')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#1565C0] outline-none"
                  >
                    <option value="Aktif">Aktif (Dapat Login)</option>
                    <option value="Nonaktif">Nonaktif (Dilarang Login)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Jabatan / Keterangan Penugasan</label>
                <input
                  type="text"
                  placeholder="Contoh: Kasi Pelayanan Umum / Jurnalis Dusun Nyurlembang Lauk"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#1565C0] outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#1565C0] hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{saving ? 'Menyimpan ke Supabase...' : editingUser ? 'Simpan Perubahan' : 'Buat User Baru'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 pb-2 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hapus Pengguna?</h3>
                <p className="text-[11px] text-slate-500">Tindakan ini permanen</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun <strong>{confirmDelete.nama_lengkap}</strong> (@{confirmDelete.username})? Pengguna tidak akan dapat mengakses dashboard lagi.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs cursor-pointer text-xs"
              >
                Ya, Hapus Pengguna
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
