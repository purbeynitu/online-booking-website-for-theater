import React from 'react';
import { Utensils, Plus, Minus, ChevronLeft, ChevronRight, Sparkles, Check } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export default function SnacksSelector({ onBack, onNext }) {
  const {
    snacksList,
    bookingDetails,
    updateSnackQuantity,
    calculateSeatSubtotal,
    calculateSnacksTotal
  } = useBooking();

  const seatTotal = calculateSeatSubtotal();
  const snacksTotal = calculateSnacksTotal();
  const combined = seatTotal + snacksTotal;

  const getItemQuantity = (id) => {
    const item = bookingDetails.snacks.find(s => s.id === id);
    return item ? item.quantity : 0;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Step Header */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
            Step 3 of 3: Snacks & Refreshments (Optional)
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-0.5">
            Grab Your Cinema Bites
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pre-order delicious hot popcorn, crispy nachos and chilled beverages for in-seat delivery!
          </p>
        </div>

        <button
          onClick={onNext}
          className="text-xs font-semibold text-slate-400 hover:text-white underline underline-offset-4 self-start md:self-auto"
        >
          Skip snacks and go straight to checkout →
        </button>
      </div>

      {/* Snacks Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {snacksList.map((snack) => {
          const qty = getItemQuantity(snack.id);

          return (
            <div
              key={snack.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                qty > 0
                  ? 'bg-slate-900/90 border-rose-500/60 shadow-lg shadow-rose-950/30'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">
                    {snack.image}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                      {snack.category}
                    </span>
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {snack.name}
                    </h4>
                    <span className="text-[11px] text-slate-400">{snack.calories}</span>
                  </div>
                </div>

                {snack.popular && (
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0">
                    Bestseller
                  </span>
                )}
              </div>

              {/* Price & Quantity Controls */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-base font-extrabold text-white">
                  ₹{snack.price}
                </div>

                {qty === 0 ? (
                  <button
                    onClick={() => updateSnackQuantity(snack, 1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white text-xs font-bold transition-all border border-slate-700 hover:border-rose-500"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-800 border border-rose-500/60 rounded-lg p-1">
                    <button
                      onClick={() => updateSnackQuantity(snack, -1)}
                      className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-extrabold text-white px-2">
                      {qty}
                    </span>
                    <button
                      onClick={() => updateSnackQuantity(snack, 1)}
                      className="w-6 h-6 rounded bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Bar */}
      <div className="sticky bottom-4 z-40 glass-panel p-4 sm:p-5 rounded-2xl border border-slate-700/80 bg-slate-950/90 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors self-start sm:self-auto"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Seat Selection</span>
        </button>

        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
          <div>
            <div className="text-[11px] text-slate-400">
              Seats (₹{seatTotal}) + Snacks (₹{snacksTotal})
            </div>
            <div className="text-lg font-black text-white">
              ₹{combined}
            </div>
          </div>

          <button
            onClick={onNext}
            className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold px-7 py-3 rounded-xl shadow-lg shadow-rose-600/30 transition-all"
          >
            <span>Proceed to Checkout</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
