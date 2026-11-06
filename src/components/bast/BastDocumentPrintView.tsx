'use client';

import React from 'react';
import { formatDate } from '@/lib/utils';
import { ASSET_CONDITIONS } from '@/lib/constants';

interface BastDocumentProps {
  document: {
    id: string;
    documentNumber: string;
    type: string;
    title: string;
    date: Date | string;
    issuerName: string;
    issuerPosition: string;
    issuerDepartment?: string | null;
    recipientName: string;
    recipientNik?: string | null;
    recipientPosition?: string | null;
    recipientDepartment?: string | null;
    reason?: string | null;
    effectiveDate?: Date | string | null;
    notes?: string | null;
    items: any[];
    company: {
      name: string;
      code: string;
      address?: string | null;
      phone?: string | null;
      email?: string | null;
      website?: string | null;
    };
  };
}

export function BastDocumentPrintView({ document }: BastDocumentProps) {
  const { company, items } = document;

  return (
    <div className="print-container bg-white text-black p-8 sm:p-12 max-w-4xl mx-auto border border-slate-200 shadow-md sm:rounded-xl">
      {/* 1. KOP SURAT PERUSAHAAN (COMPANY HEADER) */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-slate-900">
            {company.name}
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-lg leading-relaxed">
            {company.address ||
              'Cyber 2 Tower Lt. 18, Jl. H.R. Rasuna Said Blok X-5 Kav. 13, Jakarta Selatan 12950'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Telp: {company.phone || '+62 21 5289 7700'} • Email:{' '}
            {company.email || 'asset.management@solusinusantara.co.id'} • Web:{' '}
            {company.website || 'www.solusinusantara.co.id'}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="inline-block border-2 border-slate-900 px-3 py-1 font-mono font-bold text-xs uppercase tracking-wider">
            ASSET MANAGEMENT
          </div>
        </div>
      </div>

      {/* 2. JUDUL DOKUMEN & NOMOR */}
      <div className="my-6 text-center">
        <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-900 underline underline-offset-4">
          {document.title || 'BERITA ACARA SERAH TERIMA ASET'}
        </h2>
        <p className="font-mono text-xs font-semibold text-slate-700 mt-1.5">
          Nomor: {document.documentNumber}
        </p>
      </div>

      {/* 3. PARAGRAF PEMBUKA */}
      <div className="text-xs leading-relaxed text-slate-800 space-y-4">
        <p>
          Pada hari ini, <strong>{formatDate(document.date)}</strong>, bertempat di
          lingkungan kantor <strong>{company.name}</strong>, telah dilakukan serah
          terima inventaris aset kedinasan perusahaan antara pihak-pihak sebagai
          berikut:
        </p>

        {/* 4. IDENTITAS PIHAK PERTAMA (PENYERAH) */}
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
          <span className="font-bold text-[11px] uppercase tracking-wider text-slate-700 block mb-2">
            I. PIHAK PERTAMA (PENYERAH / ASSET MANAGEMENT)
          </span>
          <table className="text-xs w-full">
            <tbody>
              <tr>
                <td className="w-28 text-slate-500 py-0.5">Nama Lengkap</td>
                <td className="w-4">:</td>
                <td className="font-semibold text-slate-900">{document.issuerName}</td>
              </tr>
              <tr>
                <td className="text-slate-500 py-0.5">Jabatan</td>
                <td>:</td>
                <td>{document.issuerPosition}</td>
              </tr>
              <tr>
                <td className="text-slate-500 py-0.5">Departemen</td>
                <td>:</td>
                <td>{document.issuerDepartment || 'Information & Technology'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 5. IDENTITAS PIHAK KEDUA (PENERIMA / KARYAWAN) */}
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
          <span className="font-bold text-[11px] uppercase tracking-wider text-slate-700 block mb-2">
            II. PIHAK KEDUA (PENERIMA / KARYAWAN BERSANGKUTAN)
          </span>
          <table className="text-xs w-full">
            <tbody>
              <tr>
                <td className="w-28 text-slate-500 py-0.5">Nama Lengkap</td>
                <td className="w-4">:</td>
                <td className="font-semibold text-slate-900">{document.recipientName}</td>
              </tr>
              <tr>
                <td className="text-slate-500 py-0.5">NIK</td>
                <td>:</td>
                <td className="font-mono font-bold text-slate-900">
                  {document.recipientNik || '-'}
                </td>
              </tr>
              <tr>
                <td className="text-slate-500 py-0.5">Jabatan</td>
                <td>:</td>
                <td>{document.recipientPosition || '-'}</td>
              </tr>
              <tr>
                <td className="text-slate-500 py-0.5">Departemen</td>
                <td>:</td>
                <td>{document.recipientDepartment || '-'}</td>
              </tr>
              {document.reason && (
                <tr>
                  <td className="text-slate-500 py-0.5">Alasan / Status</td>
                  <td>:</td>
                  <td className="font-semibold text-slate-900">{document.reason}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p>
          Kedua belah pihak sepakat melakukan serah terima aset inventaris dengan rincian
          dan spesifikasi teknis sebagaimana tercantum pada tabel di bawah ini:
        </p>

        {/* 6. TABEL RINCIAN ASET */}
        <div className="overflow-x-auto my-4">
          <table className="w-full border-collapse border border-slate-300 text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold">
                <th className="border border-slate-300 p-2 text-center w-8">No</th>
                <th className="border border-slate-300 p-2">Asset Tag</th>
                <th className="border border-slate-300 p-2">Nama Aset & Spesifikasi</th>
                <th className="border border-slate-300 p-2">Serial Number (S/N)</th>
                <th className="border border-slate-300 p-2 text-center">Kondisi</th>
                <th className="border border-slate-300 p-2">Aksesoris / Catatan</th>
              </tr>
            </thead>
            <tbody>
              {items && items.length > 0 ? (
                items.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/50">
                    <td className="border border-slate-300 p-2 text-center font-medium">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-300 p-2 font-mono font-bold text-slate-900">
                      {item.assetTag}
                    </td>
                    <td className="border border-slate-300 p-2">
                      <div className="font-semibold text-slate-900">{item.assetName}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.brand ? `${item.brand} ` : ''}
                        {item.model || ''}
                      </div>
                    </td>
                    <td className="border border-slate-300 p-2 font-mono text-[11px]">
                      {item.serialNumber || '-'}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-semibold">
                      {ASSET_CONDITIONS[item.condition as keyof typeof ASSET_CONDITIONS]
                        ?.label || item.condition}
                    </td>
                    <td className="border border-slate-300 p-2 text-[11px] text-slate-600">
                      {item.accessories || item.notes || 'Lengkap'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="border border-slate-300 p-4 text-center text-slate-400">
                    Tidak ada item aset yang terlampir
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 7. KETENTUAN DAN PERNYATAAN HUKUM */}
        <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/60 space-y-2 text-[11px] text-slate-700 leading-relaxed">
          <span className="font-bold text-slate-900 block text-xs">
            Ketentuan dan Pernyataan:
          </span>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Pihak Kedua menyatakan telah memeriksa dan menerima seluruh aset inventaris
              tersebut di atas dalam kuantitas dan kondisi fisik sebagaimana tertulis.
            </li>
            <li>
              Pihak Kedua bertanggung jawab penuh atas penggunaan, pemeliharaan, dan
              keamanan fisik perangkat sesuai Kebijakan Manajemen Aset Perusahaan.
            </li>
            <li>
              Segala bentuk kehilangan atau kerusakan yang terjadi akibat kelalaian wajib
              segera dilaporkan ke Departemen IT / Asset Management.
            </li>
            <li>
              Apabila terjadi pemutusan hubungan kerja, pensiun, atau mutasi dinas, aset
              wajib dikembalikan dalam keadaan lengkap dan berfungsi baik.
            </li>
          </ol>
        </div>

        {document.notes && (
          <p className="text-[11px] text-slate-600 italic">
            Catatan Tambahan: {document.notes}
          </p>
        )}

        <p className="pt-2">
          Demikian Berita Acara Serah Terima Aset ini dibuat dengan sebenarnya dalam
          rangkap 2 (dua) yang masing-masing mempunyai kekuatan hukum yang sama untuk
          dipergunakan sebagaimana mestinya.
        </p>

        {/* 8. RUANG TANDA TANGAN (SIGNATURE SECTION) */}
        <div className="pt-8 page-break-inside-avoid">
          <div className="text-right text-xs mb-6 text-slate-600">
            Jakarta, {formatDate(document.date)}
          </div>

          <div className="grid grid-cols-2 gap-8 text-center text-xs">
            {/* PIHAK PERTAMA */}
            <div className="space-y-16">
              <div>
                <span className="font-bold text-slate-900 block uppercase">
                  PIHAK PERTAMA
                </span>
                <span className="text-[11px] text-slate-500 uppercase">
                  (PENYERAH / IT ASSET MANAGEMENT)
                </span>
              </div>
              <div className="border-t border-slate-400 pt-2 inline-block min-w-[200px]">
                <span className="font-bold text-slate-900 block underline">
                  {document.issuerName}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {document.issuerPosition}
                </span>
              </div>
            </div>

            {/* PIHAK KEDUA */}
            <div className="space-y-16">
              <div>
                <span className="font-bold text-slate-900 block uppercase">
                  PIHAK KEDUA
                </span>
                <span className="text-[11px] text-slate-500 uppercase">
                  (PENERIMA / KARYAWAN)
                </span>
              </div>
              <div className="border-t border-slate-400 pt-2 inline-block min-w-[200px]">
                <span className="font-bold text-slate-900 block underline">
                  {document.recipientName}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  NIK: {document.recipientNik || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 9. FOOTER DOKUMEN */}
        <div className="pt-8 border-t border-slate-200 text-center text-[10px] text-slate-400 mt-8">
          Dokumen ini digenerate secara otomatis oleh sistem <strong>AssetFlow Enterprise</strong> pada{' '}
          {new Date().toLocaleString('id-ID')} • Lembar Arsip Resmi Perusahaan
        </div>
      </div>
    </div>
  );
}
