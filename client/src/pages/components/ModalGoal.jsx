import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createGoal, deleteGoal } from "../../lib/api";
import { alertError, alertSuccess } from "../../lib/alert";

const ModalGoal = ({ open, close, data }) => {
  const closeButtonRef = useRef(null);
  const { register, handleSubmit, reset, setValue } = useForm();
  const queryClient = useQueryClient();

  // === PAGINATION STATE ===
  const [page, setPage] = useState(1);
  const pageSize = 5; // jumlah data per halaman

  // Hitung total halaman
  const totalPages = data ? Math.ceil(data.length / pageSize) : 1;

  // Ambil data sesuai halaman
  const paginatedData = data
    ? data.slice((page - 1) * pageSize, page * pageSize)
    : [];

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

  // CREATE GOAL
  const { isPending, mutate } = useMutation({
    mutationKey: ["createGoal"],
    mutationFn: createGoal,
    onSuccess: (res) => {
      alertSuccess(res.msg);
      queryClient.invalidateQueries(["getAll"]); // refresh data
      reset();
      setPage(1); // reset ke halaman pertama setelah tambah data
    },
    onError: (error) => {
      alertError(error?.message || "Gagal membuat goal");
    },
  });
  
  // DELETE GOAL
  const { isPending: pendingDelete, mutate: mutateDelete } = useMutation({
    mutationKey: ["deleteGoal"],
    mutationFn: (id) => deleteGoal(id),
    onSuccess: (res) => {
      alertSuccess(res.msg);
      queryClient.invalidateQueries(["getAll"]); // refresh data
      if (page > 1 && paginatedData.length === 1) {
        setPage((p) => p - 1); // kalau dihapus item terakhir di halaman, mundur 1 halaman
      }
    },
    onError: (error) => {
      alertError(res.msg);
      console.log(error?.message || "Gagal menghapus goal");
    },
  });

  if (!open) return null;

  const onSubmit = (formData) => {
    // pastikan target disimpan dalam bentuk angka (bukan string format)
    const cleanTarget = formData.target.replace(/\./g, "");
    mutate({ ...formData, target: cleanTarget });
  };

  const handleDelete = (id) => {
    mutateDelete(id);
  };

  // === Format input Target jadi IDR ===
  const handleTargetChange = (e) => {
    let value = e.target.value;
    // hapus semua karakter selain angka
    value = value.replace(/\D/g, "");
    // format ke IDR (ribuan pakai titik)
    const formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    setValue("target", formatted, { shouldValidate: true });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg w-full max-w-3xl shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-slate-900">Add New Goal</h2>
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
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                type="text"
                {...register("title", { required: true })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Masukkan judul goal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Target (Rp)
              </label>
              <input
                type="text"
                {...register("target", { required: true })}
                onChange={handleTargetChange}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Masukkan target"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
            >
              {isPending ? "Loading..." : "Submit"}
            </button>
          </form>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700">
                <tr className="text-center">
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Target (Rp)</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData && paginatedData.length > 0 ? (
                  paginatedData.map((goal) => (
                    <tr
                      key={goal.id}
                      className="border-t text-center hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-2">{goal.title}</td>
                      <td className="px-4 py-2">
                        {Number(goal.target).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleDelete(goal.id)}
                          disabled={pendingDelete}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          {pendingDelete ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-4 py-4 text-center text-slate-500"
                    >
                      Belum ada data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 text-sm">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={close}
            className="rounded-lg px-4 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalGoal;
