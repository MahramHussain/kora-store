import Link from "next/link";
import { cookies } from "next/headers";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default async function TermsPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";
  const isAr = lang === "ar";

  return (
    <main className="min-h-screen bg-slate-50/50 text-slate-900 font-sans pt-32 pb-24 px-4 sm:px-6 selection:bg-kora selection:text-white">
      <div className="max-w-3xl mx-auto">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400 hover:text-kora transition-colors"
          >
            {isAr ? <FaChevronRight /> : <FaChevronLeft />}
            {isAr ? "العودة للرئيسية" : "Back to Home"}
          </Link>
        </div>

        {/* Article Container */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden text-start">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-kora via-purple-500 to-pink-500" />
          
          {isAr ? (
            // ARABIC VERSION
            <article dir="rtl" className="space-y-8 font-sans">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-kora block mb-2">شروط الخدمة</span>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">شروط وأحكام الاستخدام</h1>
                <p className="text-xs text-slate-400 mt-2 font-mono">آخر تحديث: 11 يوليو 2026</p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                مرحباً بكم في متجر كورة (Kora Store). من خلال تصفحكم أو شرائكم من هذا الموقع، فإنكم توافقون على الالتزام بالشروط والأحكام التالية. يرجى قراءتها بعناية.
              </p>

              <hr className="border-slate-100" />

              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">1. الطلبات والمبيعات</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  جميع الأسعار المعروضة على الموقع هي بالدرهم الإماراتي (AED). نحتفظ بالحق في تعديل الأسعار في أي وقت دون إشعار مسبق. يتم تأكيد الطلبات فقط بعد إتمام عملية الدفع بنجاح أو من خلال تأكيد خيار الدفع عند الاستلام.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">2. الطباعة والتخصيص</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  القمصان التي يتم طلبها مع طباعة مخصصة (اسم ورقم مخصص أو لاعب محدد) يتم تصنيعها وتخصيصها خصيصاً لكم. بمجرد بدء إنتاج الطلب المخصص، لا يمكن إلغاؤه أو إرجاعه أو استبداله إلا في حالة وجود عيب مصنعي واضح.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">3. الشحن والتوصيل</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  نقوم بالشحن إلى جميع أنحاء دولة الإمارات العربية المتحدة في غضون 1 إلى 2 أيام عمل. نحن غير مسؤولين عن أي تأخير خارج عن إرادتنا ناتج عن شركات التوصيل أو معلومات العنوان غير الصحيحة المقدمة من العميل.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">4. سياسة الإرجاع والاستبدال</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  يمكن إرجاع أو استبدال المنتجات غير المخصصة (الخالية من أي طباعة اسم أو رقم) في غضون 7 أيام من تاريخ الاستلام، بشرط أن تكون في حالتها الأصلية مع التغليف والملصقات الأصلية. يتحمل العميل رسوم التوصيل المترتبة على الإرجاع.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">5. القانون الحاكم</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  تخضع هذه الشروط والأحكام وتفسر وفقاً للقوانين والأنظمة المعمول بها في دولة الإمارات العربية المتحدة. ويخضع أي نزاع ينشأ عنها للاختصاص القضائي الحصري لمحاكم الدولة.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">6. التواصل معنا</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  إذا كانت لديكم أي استفسارات حول شروط الخدمة، يرجى التواصل معنا عبر البريد الإلكتروني support@korastore.ae أو عبر الواتساب على الرقم 971564245926+.
                </p>
              </div>
            </article>
          ) : (
            // ENGLISH VERSION
            <article className="space-y-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-kora block mb-2">Terms of Service</span>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">Terms &amp; Conditions</h1>
                <p className="text-xs text-slate-400 mt-2 font-mono">Last Updated: July 11, 2026</p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Welcome to Kora Store. By accessing, browsing, or shopping on this website, you agree to comply with and be bound by the following Terms and Conditions. Please review them carefully.
              </p>

              <hr className="border-slate-100" />

              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">1. Orders &amp; Sales</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  All prices displayed on Kora Store are in United Arab Emirates Dirhams (AED). We reserve the right to change prices at any time without prior notice. Orders are confirmed only after successful payment processing or verification of the Cash on Delivery (COD) option.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">2. Custom Printing &amp; Personalization</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Jerseys ordered with custom printing (including personalized name, number, preset player names, or sleeve patches) are made uniquely for you. Once production has started, customized orders cannot be cancelled, returned, or exchanged unless there is an obvious manufacturing defect.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">3. Shipping &amp; Delivery</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  We ship all orders across the United Arab Emirates within 1 to 2 business days. Kora Store is not responsible for shipping delays caused by couriers, weather conditions, or incorrect address information provided by the buyer.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">4. Returns &amp; Exchanges</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Non-customized items (jerseys without print, boots, or standard accessories) can be returned or exchanged within 7 days of delivery, provided they are in brand-new, unworn condition with original packaging and tags attached. Return courier fees are the responsibility of the customer.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">5. Governing Law</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  These terms are governed by and construed in accordance with the laws of the United Arab Emirates. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the courts of the UAE.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">6. Contact Information</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  For questions regarding our terms, please hit us up via email at support@korastore.ae or reach out via WhatsApp at +971 56 424 5926.
                </p>
              </div>
            </article>
          )}

        </div>

      </div>
    </main>
  );
}
