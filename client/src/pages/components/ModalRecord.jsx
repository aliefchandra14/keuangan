import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createRecord, deleteRecord } from "../../lib/api";
import { alertError, alertSuccess } from "../../lib/alert";

const ModalRecord = ({ open, close, data, totalOutcome, goals }) => {
  const queryClient = useQueryClient();
  const closeButtonRef = useRef(null);
  const { register, handleSubmit, reset, watch, setValue } = useForm();
  const [records, setRecords] = useState([]);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // ambil income & emergencyOutcome dari input
  const income = watch("income") || 0;
  const emergencyOutcome = watch("emergencyOutcome") || 0;

  // outcome diambil otomatis dari props
  const outcome = Number(totalOutcome) || 0;

  // total invest dihitung otomatis
  const totalInvest = income - outcome - emergencyOutcome;

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  const { isPending, mutate } = useMutation({
    mutationKey: ["addRecord"],
    mutationFn: createRecord,
    onSuccess: (data) => {
      alertSuccess(data.msg);
      queryClient.invalidateQueries("getAll");
      reset();
    },
    onError: (error) => {
      alertError(error.message);
    },
  });
  
  const { isPending: isPendingDelete, mutate: mutateDelete } = useMutation({
    mutationKey: ["deleteRecord"],
    mutationFn: deleteRecord,
    onSuccess: (data) => {
      alertSuccess(data.msg);
      queryClient.invalidateQueries("getAll");
    },
    onError: (error) => {
      alertError(error.message);
    },
  });

  if (!open) return null;

  // Format Rupiah
  const formatRupiah = (value) => {
    if (!value) return "0";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Handle input format Rupiah
  const handleRupiahChange = (e, fieldName) => {
    const rawValue = e.target.value.replace(/\D/g, ""); // Hanya angka
    setValue(fieldName, rawValue ? parseInt(rawValue) : 0); // Simpan sebagai number
  };

  const onSubmit = (formData) => {
    const payload = {
      bulan: formData.bulan,
      tahun: formData.tahun,
      income: Number(income),
      outcome: outcome, // langsung dari props
      emergency_outcome: Number(emergencyOutcome),
      emergency_outcome_reason: formData.reason,
      type_invest: formData.type_invest || goals?.[0]?.title || "lainnya", // ambil dari select
      total: totalInvest,
    };

    mutate(payload); // kirim ke backend
  };

  const handleDelete = (id) => {
    if (!id) return;
    mutateDelete(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // pagination logic
  const totalPages = Math.ceil((data?.length || 0) / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = data?.slice(startIndex, startIndex + rowsPerPage);

  // ✅ Perbaikan pagination biar gak nyangkut di page kosong
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
    }
  }, [currentPage, totalPages]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg w-full max-w-4xl shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-slate-900">Update Record</h2>
          <button
            ref={closeButtonRef}
            onClick={close}
            aria-label="Close modal"
            className="p-2 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 bg-slate-50 p-4 rounded-lg"
          >
            {/* Bulan */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Bulan
              </label>
              <select
                {...register("bulan", { required: true })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Pilih Bulan</option>
                {[
                  "Januari",
                  "Februari",
                  "Maret",
                  "April",
                  "Mei",
                  "Juni",
                  "Juli",
                  "Agustus",
                  "September",
                  "Oktober",
                  "November",
                  "Desember",
                ].map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Tahun */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Tahun
              </label>
              <select
                {...register("tahun", { required: true })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Pilih Tahun</option>
                {[2023, 2024, 2025, 2026].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Income */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Income (Rp)
              </label>
              <input
                type="text"
                value={formatRupiah(income)}
                onChange={(e) => handleRupiahChange(e, "income")}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Masukkan income"
              />
            </div>

            {/* Outcome (readonly dari props) */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Outcome (Rp)
              </label>
              <input
                type="text"
                value={formatRupiah(outcome)}
                readOnly
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-slate-100 text-slate-600"
              />
            </div>

            {/* Emergency Outcome */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Emergency Outcome (Rp)
              </label>
              <input
                type="text"
                value={formatRupiah(emergencyOutcome)}
                onChange={(e) => handleRupiahChange(e, "emergencyOutcome")}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Masukkan emergency outcome"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Reason
              </label>
              <textarea
                {...register("reason")}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Masukkan alasan"
              />
            </div>

            {/* Type Invest */}
            <div>
              <label className="block text-sm font-medium">Type Invest</label>
              <select
                {...register("type_invest", { required: true })}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">-- Pilih Investasi --</option>
                {goals &&
                  goals.map((goal) => (
                    <option key={goal.id} value={goal.title}>
                      {goal.title}
                    </option>
                  ))}
              </select>
            </div>

            {/* Total Invest */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Total Invest (Rp)
              </label>
              <input
                type="text"
                value={formatRupiah(totalInvest)}
                readOnly
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {isPending ? "Menyimpan..." : "Submit"}
            </button>
          </form>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700">
                <tr className="text-center">
                  <th className="px-4 py-2">Bulan</th>
                  <th className="px-4 py-2">Tahun</th>
                  <th className="px-4 py-2">Income</th>
                  <th className="px-4 py-2">Outcome</th>
                  <th className="px-4 py-2">Emergency</th>
                  <th className="px-4 py-2">Type Invest</th>
                  <th className="px-4 py-2">Total Invest</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentData?.length > 0 ? (
                  currentData.map((rec) => (
                    <tr
                      key={rec.id}
                      className="border-t text-center hover:bg-slate-50"
                    >
                      <td>{rec.bulan}</td>
                      <td>{rec.tahun}</td>
                      <td>{formatRupiah(rec.income)}</td>
                      <td>{formatRupiah(rec.outcome)}</td>
                      <td>{formatRupiah(rec.emergency_outcome)}</td>
                      <td>{rec.type_invest}</td>
                      <td>
                        {formatRupiah(
                          rec.income - rec.outcome - rec.emergency_outcome
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(rec.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                          disabled={isPendingDelete}
                        >
                          {isPendingDelete ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-4 text-center text-slate-500"
                    >
                      Belum ada data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-sm text-slate-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={close}
            className="rounded-lg px-4 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalRecord;
