"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CURRENCY } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { FaTrash, FaArrowRight, FaCheck, FaTriangleExclamation } from "react-icons/fa6";
import FreeDeliveryBar from "@/components/FreeDeliveryBar";
import { useTranslation } from "@/context/LanguageContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, syncCartStock } = useCart();
  const router = useRouter();
  const { t, language } = useTranslation();

  // Validate and sync live stock with the database whenever cart page mounts
  useEffect(() => {
    syncCartStock();
  }, [syncCartStock]);

  // Smart Math: Convert string prices like "$120" into numbers to calculate the total
  const subtotal = cart.reduce((total, item) => {
    const numericPrice = parseFloat(item.price.replace(CURRENCY.trim(), "").replace("$", ""));
    return total + (numericPrice * item.quantity);
  }, 0);

  const shippingCharge = subtotal >= 200 ? 0 : 25;
  const hasOutOfStockItem = cart.some((item) => item.maxStock !== undefined && item.maxStock === 0);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-kora selection:text-white pt-20 pb-16 px-4 sm:px-6 md:pt-24 md:pb-24 text-start transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-10 uppercase font-sans">
          {language === "ar" ? (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-kora to-purple-400">سلتك</span>
          ) : (
            <>
              YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-kora to-purple-400">CART</span>
            </>
          )}
        </h1>

        {cart.length === 0 ? (
          // EMPTY CART STATE
          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 font-sans">{t("empty_cart_title")}</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto font-sans">{t("empty_cart_desc")}</p>
            <Link
              href="/shop"
              className="inline-block bg-kora hover:bg-purple-700 text-white font-bold py-4 px-10 rounded-full transition-all shadow-md shadow-kora/30 text-sm"
            >
              {t("browse_shop")}
            </Link>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* FREE DELIVERY PROGRESS BAR */}
            <FreeDeliveryBar subtotal={subtotal} />

            {/* ACTIVE CART STATE */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              {/* Left: Cart Items List */}
              <div className="flex-1 space-y-4 sm:space-y-6">
                {cart.map((item, index) => {
                  const maxStock = item.maxStock !== undefined ? item.maxStock : 999;
                  const isAtMax = item.quantity >= maxStock;
                  const isOutOfStock = maxStock === 0;

                  return (
                    <div
                      key={`${item.id}-${item.size}-${index}`}
                      className="flex gap-4 sm:gap-6 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-5 relative group shadow-sm hover:shadow-md transition-all text-start"
                    >
                      {/* Image */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-2 flex items-center justify-center shadow-sm">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain drop-shadow-md" />
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-center py-1 sm:py-2 font-sans ltr:pr-6 rtl:pl-6 text-start">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-lg leading-tight line-clamp-2">
                          {t(String(item.id)) !== String(item.id) ? t(String(item.id)) : item.name}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-y-1">
                          <span>
                            {t("size_label")}: <span className="font-bold text-slate-900 dark:text-slate-100">{item.size}</span>
                          </span>
                          {(item.customName || item.customNumber) && (
                            <>
                              <span className="mx-1 sm:mx-2 text-slate-300 dark:text-slate-600">•</span>
                              <span>
                                {t("print_label")}:{" "}
                                <span className="font-bold text-kora dark:text-purple-400">
                                  {item.customName || "—"} {item.customNumber ? `#${item.customNumber}` : ""}
                                </span>
                              </span>
                            </>
                          )}
                          {item.patch && (
                            <>
                              <span className="mx-1 sm:mx-2 text-slate-300 dark:text-slate-600">•</span>
                              <span>
                                {t("patch_label")}: <span className="font-bold text-indigo-600 dark:text-indigo-400">{item.patch}</span>
                              </span>
                            </>
                          )}
                          {item.sellerNote && (
                            <>
                              <span className="mx-1 sm:mx-2 text-slate-300 dark:text-slate-600">•</span>
                              <span>
                                {t("note_label")}: <span className="font-bold text-slate-700 dark:text-slate-300 italic">{item.sellerNote}</span>
                              </span>
                            </>
                          )}
                        </p>

                        <p className="text-sm sm:text-base font-bold text-kora dark:text-purple-400 mt-1">
                          {t("aed")}{parseFloat(item.price).toFixed(2)}
                        </p>

                        {/* Quantity Selector & Live Inventory Limit Feedback */}
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <div className="flex items-center gap-3 bg-white dark:bg-slate-950 w-max rounded-full p-1 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.size,
                                  item.image,
                                  item.customName,
                                  item.customNumber,
                                  item.quantity - 1,
                                  item.playerName,
                                  item.patch,
                                  item.sellerNote
                                )
                              }
                              className="w-7 h-7 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                              title={language === "ar" ? "تقليل الكمية" : "Decrease quantity"}
                            >
                              −
                            </button>
                            <span className="font-bold text-slate-900 dark:text-white text-sm w-5 text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (!isAtMax) {
                                  updateQuantity(
                                    item.id,
                                    item.size,
                                    item.image,
                                    item.customName,
                                    item.customNumber,
                                    item.quantity + 1,
                                    item.playerName,
                                    item.patch,
                                    item.sellerNote
                                  );
                                }
                              }}
                              disabled={isAtMax}
                              className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                                isAtMax
                                  ? "text-slate-300 dark:text-slate-700 bg-slate-100/50 dark:bg-slate-900/60 cursor-not-allowed opacity-40"
                                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                              }`}
                              title={
                                isAtMax
                                  ? language === "ar"
                                    ? `الحد الأقصى المتوفر: ${maxStock}`
                                    : `Maximum available in stock: ${maxStock}`
                                  : language === "ar"
                                  ? "زيادة الكمية"
                                  : "Increase quantity"
                              }
                            >
                              +
                            </button>
                          </div>

                          {/* Inventory Limit Alerts & Badges */}
                          {isOutOfStock ? (
                            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                              <span>⚠️</span>
                              <span>{language === "ar" ? "نفد من المخزون" : "Out of Stock"}</span>
                            </span>
                          ) : isAtMax ? (
                            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                              <span>⚠️</span>
                              <span>
                                {language === "ar"
                                  ? `الحد الأقصى المتوفر (${maxStock})`
                                  : `Max available (${maxStock})`}
                              </span>
                            </span>
                          ) : maxStock <= 3 ? (
                            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                              <span>
                                {language === "ar"
                                  ? `متبقي ${maxStock} فقط في المخزون`
                                  : `Only ${maxStock} left in stock`}
                              </span>
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() =>
                          removeFromCart(
                            item.id,
                            item.size,
                            item.image,
                            item.customName,
                            item.customNumber,
                            item.playerName,
                            item.patch,
                            item.sellerNote
                          )
                        }
                        className="absolute top-2 ltr:right-2 rtl:left-2 sm:top-4 ltr:sm:right-4 rtl:sm:left-4 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-2"
                        title={language === "ar" ? "إزالة من السلة" : "Remove from cart"}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Right: Checkout Summary */}
              <div className="w-full lg:w-[400px] shrink-0 text-start">
                <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 sticky top-32 transition-all duration-500 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-800 pb-4 uppercase font-sans">
                    {t("order_summary")}
                  </h3>

                  <div className="space-y-4 mb-6 text-slate-600 dark:text-slate-400 font-sans">
                    <div className="flex justify-between">
                      <span>{t("subtotal_label")}</span>
                      <span className="text-slate-900 dark:text-white font-bold">{t("aed")}{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("uae_delivery_label")}</span>
                      <span className="text-slate-900 dark:text-white font-bold">
                        {shippingCharge === 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full text-xs">
                            <FaCheck className="text-[10px]" />
                            <span>{t("free_label")}</span>
                          </span>
                        ) : (
                          `${t("aed")}25.00`
                        )}
                      </span>
                    </div>
                  </div>

                  {shippingCharge > 0 && (
                    <div className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/40 rounded-xl px-3 py-2 mb-6 flex items-center justify-between">
                      <span>
                        {language === "ar"
                          ? `أضف ${(200 - subtotal).toFixed(2)} درهم للشحن المجاني`
                          : `Add AED ${(200 - subtotal).toFixed(2)} for FREE delivery`}
                      </span>
                      <span className="font-extrabold text-kora dark:text-purple-400">
                        {Math.min(100, Math.round((subtotal / 200) * 100))}%
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-6 mb-8 font-sans">
                    <span className="font-bold text-slate-900 dark:text-white uppercase">{t("total_label")}</span>
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">
                      {t("aed")}{(subtotal + shippingCharge).toFixed(2)}
                    </span>
                  </div>

                  {hasOutOfStockItem && (
                    <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 font-bold">
                      <FaTriangleExclamation className="shrink-0 text-sm" />
                      <span>
                        {language === "ar"
                          ? "يرجى حذف المنتجات غير المتوفرة للمتابعة إلى الدفع."
                          : "Please remove out-of-stock items before proceeding to checkout."}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => router.push("/checkout")}
                    disabled={hasOutOfStockItem}
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-kora dark:hover:bg-purple-600 dark:hover:text-white font-bold text-sm uppercase tracking-wider py-4 rounded-full transition-all flex justify-center items-center gap-3 group shadow-md hover:shadow-kora/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span>{t("secure_checkout_btn")}</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                  </button>

                  <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6 font-sans">
                    {t("taxes_calculated_desc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
