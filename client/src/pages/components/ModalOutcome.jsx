import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createOutcome, deleteOutcome } from "../../lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { alertError, alertSuccess } from "../../lib/alert";

const ModalOutcome = ({ open, close, data }) => {
  const queryClient = useQueryClient();
  const closeButtonRef = useRef(null);
  const { register, handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: {
      title: "",
      price: "",
      quantity: 1,
      total: "",
    },
  });
  const [outcomes, setOutcomes] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const price = watch("price");
  const quantity = watch("quantity");

  // Format harga jadi IDR
  const formatIDR = (value) => {
    if (!value) return "";
    const numberString = value.replace(/[^\d]/g, "");
    return new Intl.NumberFormat("id-ID").format(Number(numberString));
  };

  // Update total saat price / quantity berubah
  useEffect(() => {
    const numPrice = Number((price || "0").replace(/[^\d]/g, ""));
    const numQty = Number(quantity || 0);
    const total = numPrice * numQty;
    setValue("total", formatIDR(String(total)));
  }, [price, quantity, setValue]);

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

  // Mutations
  const { isPending, mutate } = useMutation({
    mutationKey: ["addOutcome"],
    mutationFn: createOutcome,
    onSuccess: (res) => {
      alertSuccess(res.msg);
      queryClient.invalidateQueries("getAll");
      console.log(res.msg);
    },
    onError: (error) => {
      alertError(error.message);
      console.log(error.stack);
    },
  });
  
  const { isPending: isPendingDelete, mutate: mutateDelete } = useMutation({
    mutationKey: ["deleteOutcome"],
    mutationFn: deleteOutcome,
    onSuccess: (res) => {
      alertSuccess(res.msg);
      queryClient.invalidateQueries("getAll");
    },
    onError: (error) => {
      alertError(error.message);
    },
  });

  if (!open) return null;

  const onSubmit = (formData) => {
    const newData = { id: Date.now(), ...formData };
    setOutcomes((prev) => [...prev, newData]);
    reset({ title: "", price: "", quantity: 1, total: "" });

    // Kirim ke backend
    mutate(formData);
  };

  const handleDelete = (id) => {
    setOutcomes((prev) => prev.filter((o) => o.id !== id));

    // Kirim ke backend
    mutateDelete(id);
  };

  // Pagination logic
  const totalPages = Math.ceil((data?.length || 0) / itemsPerPage);

  // ✅ Fix: jika currentPage > totalPages setelah data berubah, mundurkan halaman
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages : 1);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data?.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
          <h2 className="text-lg md:text-xl font-bold text-slate-900">
            Add Outcome
          </h2>
          <button
            ref={closeButtonRef}
            onClick={close}
            aria-label="Close modal"
            className="p-2 rounded-full hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 bg-slate-50 p-4 rounded-xl shadow-sm"
          >
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                type="text"
                {...register("title", { required: true })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Masukkan judul outcome"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Price (Rp)
              </label>
              <input
                type="text"
                {...register("price", { required: true })}
                value={price}
                onChange={(e) => setValue("price", formatIDR(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Masukkan harga"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Quantity
              </label>
              <input
                type="number"
                {...register("quantity", { required: true, min: 1 })}
                min={1}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Total */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Total (Rp)
              </label>
              <input
                type="text"
                {...register("total")}
                readOnly
                className="mt-1 w-full bg-slate-100 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full md:w-auto bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            >
              {isPending ? "Loading..." : "Submit"}
            </button>
          </form>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
            <table className="min-w-full text-sm text-slate-700">
              <thead className="bg-slate-100">
                <tr className="text-center">
                  <th className="px-4 py-2 font-medium">Title</th>
                  <th className="px-4 py-2 font-medium">Price</th>
                  <th className="px-4 py-2 font-medium">Qty</th>
                  <th className="px-4 py-2 font-medium">Total</th>
                  <th className="px-4 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentData?.length > 0 ? (
                  currentData.map((o) => (
                    <tr
                      key={o.id}
                      className="border-t text-center hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-2">{o.title}</td>
                      <td className="px-4 py-2">{o.price}</td>
                      <td className="px-4 py-2">{o.qty}</td>
                      <td className="px-4 py-2">{o.total}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleDelete(o.id)}
                          disabled={isPendingDelete}
                          className="text-red-600 hover:text-red-800 font-medium transition"
                        >
                          {isPendingDelete ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
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
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
          <button
            onClick={close}
            className="rounded-lg px-4 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalOutcome;
