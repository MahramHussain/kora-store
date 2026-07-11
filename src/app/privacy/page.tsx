import Link from "next/link";
import { cookies } from "next/headers";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default async function PrivacyPage() {
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
                <span className="text-[10px] font-black uppercase tracking-widest text-kora block mb-2">سياسة الخصوصية</span>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">سياسة حماية الخصوصية</h1>
                <p className="text-xs text-slate-400 mt-2 font-mono">آخر تحديث: 11 يوليو 2026</p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                في متجر كورة (Kora Store)، نحن ملتزمون التزاماً تاماً بحماية خصوصية زوارنا وعملائنا. توضح هذه السياسة كيفية جمع بياناتكم الشخصية واستخدامها وحمايتها عند زيارتكم لموقعنا.
              </p>

              <hr className="border-slate-100" />

              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">1. المعلومات التي نجمعها</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  نقوم بجمع معلوماتكم الشخصية عند قيامكم بإنشاء حساب، أو تقديم طلب شراء، أو التواصل معنا. تشمل هذه البيانات: الاسم، عنوان البريد الإلكتروني، رقم الهاتف، وعنوان الشحن والتوصيل.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">2. كيف نستخدم معلوماتكم</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  نستخدم البيانات التي نجمعها لمعالجة طلباتكم وتأكيدها وتوصيلها، وإرسال تحديثات حالة الشحن، وتوفير الدعم الفني وخدمة العملاء، وتحسين تجربة التصفح وتطوير متجرنا.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">3. حماية البيانات ومشاركتها</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  نحن لا نبيع أو نؤجر أو نشارك معلوماتكم الشخصية مع أطراف ثالثة لأغراض تسويقية. يتم مشاركة معلوماتكم فقط مع شركاء موثوقين ومصرح لهم للضرورة القصوى (مثل خدمات مصادقة المستخدم Clerk، بوابات الدفع الإلكتروني Ziina، وشركات شحن وتوصيل الطرود).
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">4. ملفات تعريف الارتباط (Cookies)</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  يستخدم متجر كورة ملفات تعريف الارتباط لتحسين تجربة التصفح وحفظ تفضيلات اللغة المختارة ومحتويات سلة التسوق الخاصة بكم. يمكنكم تعطيل ملفات تعريف الارتباط من خلال إعدادات متصفحكم، ولكن قد يؤثر ذلك على عمل بعض ميزات الموقع.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">5. أمن المعلومات</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  نحن نطبق مجموعة متنوعة من تدابير الأمان التكنولوجية والإدارية لحماية معلوماتكم الشخصية من الوصول غير المصرح به أو الكشف عنها أو تعديلها. يتم تشفير جميع المعاملات المالية الحساسة عبر بروتوكولات حماية آمنة (SSL).
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">6. تواصلوا معنا</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  إذا كانت لديكم أي أسئلة أو مخاوف بشأن سياسة الخصوصية الخاصة بنا، يرجى عدم التردد في التواصل مع فريق الدعم عبر البريد الإلكتروني support@korastore.ae.
                </p>
              </div>
            </article>
          ) : (
            // ENGLISH VERSION
            <article className="space-y-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-kora block mb-2">Privacy Policy</span>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">Privacy Policy</h1>
                <p className="text-xs text-slate-400 mt-2 font-mono">Last Updated: July 11, 2026</p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                At Kora Store, we are highly committed to protecting the privacy of our visitors and customers. This Privacy Policy details how we collect, use, and safeguard your personal information when you interact with our website.
              </p>

              <hr className="border-slate-100" />

              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">1. Information We Collect</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  We collect personal information when you create an account, place an order, or contact us. This data includes your name, email address, phone number, and physical shipping address.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">2. How We Use Your Information</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  The information we collect is used to process, confirm, and ship your orders, send delivery status updates, provide customer support, and enhance your browsing experience on our platform.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">3. Data Sharing &amp; Protection</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  We do not sell, rent, or trade your personal data. We only share information with trusted third-party providers required to operate our store, including Clerk (authentication), Ziina (secure payments), and our delivery couriers.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">4. Cookies</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Kora Store uses cookies to remember your preferences (like your selected language) and track items in your cart. You can manage or disable cookies through your browser settings, though doing so might affect certain store functionalities.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">5. Security Measures</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  We implement standard security practices and SSL encryption technology to keep your personal information secure from unauthorized access, alteration, or disclosure.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">6. Contacting Us</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  For inquiries or help regarding your data privacy, hit us up anytime at support@korastore.ae.
                </p>
              </div>
            </article>
          )}

        </div>

      </div>
    </main>
  );
}
