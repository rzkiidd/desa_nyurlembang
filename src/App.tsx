import React, { useState, useEffect } from 'react';
import { UserProfile, PermohonanSurat, BeritaDesa, PotensiUmkm } from './types';
import { MOCK_USERS, INITIAL_PERMOHONAN, INITIAL_BERITA, INITIAL_UMKM } from './data/mockData';
import { syncAllFromSupabase } from './lib/supabaseClient';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PublicPortal } from './components/PublicPortal';
import { FormPermohonanSurat } from './components/FormPermohonanSurat';
import { PelacakanSurat } from './components/PelacakanSurat';
import { StaffDashboard } from './components/StaffDashboard';
import { KontributorDashboard } from './components/KontributorDashboard';
import { DokumenSuratPrint } from './components/DokumenSuratPrint';
import { SqlSchemaViewer } from './components/SqlSchemaViewer';
import { DetailBerita } from './components/DetailBerita';
import { DetailUmkm } from './components/DetailUmkm';
import { HalamanPemerintahan } from './components/HalamanPemerintahan';
import { StrukturOrganisasiView } from './components/StrukturOrganisasiView';
import { FormPengaduanWarga } from './components/FormPengaduanWarga';
import { HalamanProfilDesa } from './components/HalamanProfilDesa';
import { HalamanJdihDesa } from './components/HalamanJdihDesa';

// Import raw SQL & middleware files
import sqlSchemaRaw from './supabase/schema.sql?raw';
import middlewareRaw from './supabase/middleware.example.ts?raw';

export default function App() {
  // Navigation view state
  const [currentView, setCurrentView] = useState<
    'portal' | 'permohonan' | 'pelacakan' | 'dashboard' | 'sql' | 'cetak' | 'detail_berita' | 'detail_umkm' | 'pemerintahan' | 'struktur_organisasi' | 'pengaduan' | 'profil_lengkap' | 'jdih'
  >('portal');

  // Selected article for news detail view
  const [selectedBerita, setSelectedBerita] = useState<BeritaDesa>(INITIAL_BERITA[0]);

  // Selected UMKM for product showcase view
  const [selectedUmkm, setSelectedUmkm] = useState<PotensiUmkm>(INITIAL_UMKM[0]);

  // Sub-section modal or anchor target (tentang-kami, visi-misi, sejarah, geografis, demografi, etc.)
  const [activeSubSection, setActiveSubSection] = useState<string | undefined>(undefined);

  // RBAC active simulation: null (Anon/Warga), MOCK_USERS[0] (staff_desa), MOCK_USERS[1] (user_biasa)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Selected permohonan for print preview
  const [printPermohonan, setPrintPermohonan] = useState<PermohonanSurat>(INITIAL_PERMOHONAN[0]);

  // Pre-filled ticket tracking code
  const [initialTrackingCode, setInitialTrackingCode] = useState<string | undefined>(undefined);
  const [initialTrackingNik, setInitialTrackingNik] = useState<string | undefined>(undefined);

  // Handler for print trigger from Staff Dashboard or Tracking
  const handleSelectPrint = (permohonan: PermohonanSurat) => {
    setPrintPermohonan(permohonan);
    setCurrentView('cetak');
  };

  // Handler when citizen successfully submits a new letter form
  const handlePermohonanSuccess = (nik: string, kodeTiket: string) => {
    setInitialTrackingNik(nik);
    setInitialTrackingCode(kodeTiket);
    setCurrentView('pelacakan');
  };

  // Trigger instant synchronization on initial app load
  useEffect(() => {
    syncAllFromSupabase().catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF2F6] text-[#0D2A4A] font-sans selection:bg-blue-100 selection:text-[#0D2A4A]">
      {/* Top Navigation dengan Sub-Header Standar Sesaot Portal - Terisolasi dari Dashboard dan Dokumen Cetak */}
      {currentView !== 'dashboard' && currentView !== 'cetak' && (
        <Navbar
          currentView={currentView}
          onNavigate={(view, subSection) => {
            if (view === 'dashboard' && !currentUser) {
              setCurrentUser(MOCK_USERS[0]);
            }
            setActiveSubSection(subSection);
            setCurrentView(view);
          }}
          currentUser={currentUser}
          onSelectUser={(user) => {
            setCurrentUser(user);
            if (user && currentView === 'portal') {
              setCurrentView('dashboard');
            }
          }}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'portal' && (
          <PublicPortal
            onNavigate={(target) => {
              if (target === 'permohonan') setCurrentView('permohonan');
              else if (target === 'pelacakan') setCurrentView('pelacakan');
              else if (target === 'sql') setCurrentView('sql');
              else if (target === 'pemerintahan') setCurrentView('pemerintahan');
              else if (target === 'pengaduan') setCurrentView('pengaduan');
              else if (target === 'profil_lengkap') setCurrentView('profil_lengkap');
              else if (target === 'jdih') setCurrentView('jdih');
            }}
            activeSubSection={activeSubSection}
            onClearSubSection={() => setActiveSubSection(undefined)}
            onSelectBerita={(berita) => {
              setSelectedBerita(berita);
              setCurrentView('detail_berita');
            }}
            onSelectUmkm={(umkm) => {
              setSelectedUmkm(umkm);
              setCurrentView('detail_umkm');
            }}
          />
        )}

        {currentView === 'pengaduan' && (
          <FormPengaduanWarga
            onBack={() => setCurrentView('portal')}
          />
        )}

        {currentView === 'profil_lengkap' && (
          <HalamanProfilDesa
            onBack={() => setCurrentView('portal')}
            defaultTab={activeSubSection || 'tentang'}
          />
        )}

        {currentView === 'jdih' && (
          <HalamanJdihDesa
            onBack={() => setCurrentView('portal')}
          />
        )}

        {currentView === 'detail_berita' && (
          <DetailBerita
            berita={selectedBerita}
            onBack={() => setCurrentView('portal')}
          />
        )}

        {currentView === 'detail_umkm' && (
          <DetailUmkm
            umkm={selectedUmkm}
            onBack={() => setCurrentView('portal')}
          />
        )}

        {currentView === 'pemerintahan' && (
          <HalamanPemerintahan
            onBack={() => setCurrentView('portal')}
            onNavigate={(target) => {
              if (target === 'permohonan') setCurrentView('permohonan');
              else if (target === 'pelacakan') setCurrentView('pelacakan');
            }}
          />
        )}

        {currentView === 'struktur_organisasi' && (
          <StrukturOrganisasiView
            onBack={() => setCurrentView('portal')}
            onNavigate={(target) => {
              if (target === 'permohonan') setCurrentView('permohonan');
              else if (target === 'pelacakan') setCurrentView('pelacakan');
              else if (target === 'pemerintahan') setCurrentView('pemerintahan');
            }}
          />
        )}

        {currentView === 'permohonan' && (
          <FormPermohonanSurat
            onSuccessLacak={handlePermohonanSuccess}
          />
        )}

        {currentView === 'pelacakan' && (
          <PelacakanSurat
            initialNik={initialTrackingNik}
            initialKodeTiket={initialTrackingCode}
            onGoToPermohonan={() => setCurrentView('permohonan')}
            onViewPrint={handleSelectPrint}
          />
        )}

        {currentView === 'dashboard' && (
          <div>
            {currentUser?.role === 'staff_desa' ? (
              <StaffDashboard
                currentUser={currentUser}
                onSelectPrint={handleSelectPrint}
                onBackToPortal={() => setCurrentView('portal')}
                onSelectUser={setCurrentUser}
              />
            ) : currentUser?.role === 'user_biasa' ? (
              <KontributorDashboard
                currentUser={currentUser}
                onBackToPortal={() => setCurrentView('portal')}
                onSelectUser={setCurrentUser}
              />
            ) : (
              <div className="min-h-screen flex items-center justify-center p-4 bg-[#EEF2F6]">
                <div className="max-w-md w-full p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-lg">
                  <img
                    src="/logo.png"
                    alt="Logo Desa Nyurlembang"
                    className="w-14 h-14 object-contain mx-auto mb-4 drop-shadow-sm"
                  />
                  <h2 className="text-lg font-bold text-slate-900 mb-2 font-heading">Pilih Role untuk Membuka Dashboard</h2>
                  <p className="text-xs text-slate-600 mb-6">
                    Pilih akun pengguna yang disimulasikan untuk membuka Meja Kerja Administrasi Desa Nyurlembang.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setCurrentUser(MOCK_USERS[0])}
                      className="w-full py-3 bg-[#1565C0] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      Masuk Sebagai Staf Desa (Akses Penuh)
                    </button>
                    <button
                      onClick={() => setCurrentUser(MOCK_USERS[1])}
                      className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      Masuk Sebagai Kontributor (Warta & UMKM)
                    </button>
                    <button
                      onClick={() => setCurrentView('portal')}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all mt-2"
                    >
                      ← Kembali ke Portal Publik
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'sql' && (
          <SqlSchemaViewer
            sqlContent={sqlSchemaRaw}
            middlewareContent={middlewareRaw}
          />
        )}

        {currentView === 'cetak' && (
          <DokumenSuratPrint
            permohonan={printPermohonan}
            onBack={() => {
              if (currentUser?.role === 'staff_desa') {
                setCurrentView('dashboard');
              } else {
                setCurrentView('pelacakan');
              }
            }}
          />
        )}
      </main>

      {/* Footer publik - Hanya tampil jika bukan di Dashboard atau Print */}
      {currentView !== 'dashboard' && currentView !== 'cetak' && (
        <Footer />
      )}
    </div>
  );
}
