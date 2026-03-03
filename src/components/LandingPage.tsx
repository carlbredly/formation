import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import logo from '../assets/mobutu.png'
import { useAuth } from '../contexts/AuthContext'

const COURSE_PRICE = 200
const COMMISSION_RATE = 0.10

const LandingPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden">
      {/* Background grid + gradient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.18) 1px, transparent 0)',
          backgroundSize: '26px 26px',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-500/20 via-transparent to-black"
        aria-hidden="true"
      />

      {/* Hero */}
      <header className="relative z-10 w-full border-b border-white/5 bg-gradient-to-b from-black/40 to-black/10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="logo" className="w-9 h-9 rounded-full object-cover" />
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm sm:text-base">Mobutu Academy</span>
              <span className="text-[11px] sm:text-xs text-gray-400">Online training platform</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/home"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-emerald-500/50 bg-emerald-500/10 text-xs sm:text-sm text-emerald-300 font-medium hover:bg-emerald-500/20 transition-colors"
                >
                  My courses
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 border border-white/15 hover:bg-white/15 transition-colors shrink-0"
                  title={user.email ?? 'Profile'}
                >
                  <span className="text-sm font-semibold text-white">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-gray-600 bg-black/40 text-xs sm:text-sm text-gray-100 hover:bg-white/5 transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="hidden sm:inline px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-emerald-500 text-black text-xs sm:text-sm font-semibold hover:bg-emerald-400 transition-colors"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 pt-10 pb-16 space-y-16">
        {/* Hero content */}
        <section className="grid gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] sm:text-xs text-emerald-300">
              Retouching & Editing Academy • Photoshop & Lightroom
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Photo retouching & editing courses – Photoshop & Lightroom, beginner to professional
            </h1>
            <p className="text-sm sm:text-base text-gray-300 max-w-xl">
              Mobutu Academy is an online training platform focused on <b>photo retouching</b> and{' '}
              <b>photo editing</b> with <b>Adobe Photoshop</b> and <b>Lightroom</b> – from complete beginner to
              advanced professional workflows, with hands-on projects and provided RAW files.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {user ? (
                <>
                  <button
                    onClick={() => navigate('/home')}
                    className="px-4 sm:px-6 py-2.5 rounded-full bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 transition-colors"
                  >
                    Go to my courses
                  </button>
                  <button
                    onClick={() => {
                      const section = document.getElementById('affiliation')
                      section?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="px-4 sm:px-6 py-2.5 rounded-full border border-white/15 text-sm font-medium text-white hover:bg-white/5 transition-colors"
                  >
                    Become an affiliate
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 sm:px-6 py-2.5 rounded-full bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 transition-colors"
                  >
                    Log in to student space
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-4 sm:px-6 py-2.5 rounded-full border border-emerald-500/60 text-sm font-medium text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                  >
                    Create a student account
                  </button>
                  <button
                    onClick={() => {
                      const section = document.getElementById('affiliation')
                      section?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="px-4 sm:px-6 py-2.5 rounded-full border border-white/15 text-sm font-medium text-white hover:bg-white/5 transition-colors"
                  >
                    Become an affiliate
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Preview card */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-black/40 p-5 sm:p-6 space-y-4 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
            <p className="text-xs font-medium text-emerald-300 uppercase tracking-widest">
              Your student space preview
            </p>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Courses available</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px]">
                  Coming soon
                </span>
              </div>
              <div className="h-28 rounded-xl bg-black/60 border border-white/5 flex items-center justify-center text-gray-500 text-xs text-center px-3">
                Courses will be available on January 9. Log in to be ready when they launch.
              </div>
            </div>
          </div>
        </section>

        {/* Section What you will learn */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold">What you will learn</h2>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl">
              A complete path to master photo retouching in Photoshop &amp; Lightroom, from beginner to
              professional level.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <ul className="list-disc list-inside space-y-1.5 text-gray-200">
              <li>Portrait retouching: skin, eyes, hair, details.</li>
              <li>Creative color grading and color correction.</li>
              <li>Full workflow: import, cull, retouch, export.</li>
              <li>Creating and managing Lightroom presets.</li>
            </ul>
            <ul className="list-disc list-inside space-y-1.5 text-gray-200">
              <li>Compositing and masking in Photoshop.</li>
              <li>Professional file and Lightroom catalog organization.</li>
              <li>Techniques for photographers, content creators and freelance retouchers.</li>
              <li>Hands-on exercises with provided RAW files for each module.</li>
            </ul>
          </div>
        </section>

        {/* Section Why Us */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold">Why choose Mobutu Academy?</h2>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl">
              A photo retouching academy that combines hands-on teaching, modern tools and support to take you
              from beginner to ready to charge for your work.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2">
              <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wide">
                Practice-first
              </p>
              <p className="text-gray-200">
                Real exercises, before/after, skin corrections, color grading, beauty and product retouching.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2">
              <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wide">
                Beginner to pro
              </p>
              <p className="text-gray-200">
                From Photoshop &amp; Lightroom basics to advanced techniques: masks, layers, LUTs, presets.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2">
              <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wide">
                For creators
              </p>
              <p className="text-gray-200">
                Built for photographers, content creators and freelancers who want to sell retouching services.
              </p>
            </div>
          </div>
        </section>

        {/* Affiliate section */}
        <section id="affiliation" className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold">Earn with your promo code</h2>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl">
              For every person who buys a course with your promo code, you earn{' '}
              <span className="font-semibold text-emerald-300">{(COMMISSION_RATE * 100).toFixed(0)}%</span> of the
              course price. On a <span className="font-semibold">${COURSE_PRICE}</span> course, that&apos;s{' '}
              <span className="font-semibold text-emerald-300">
                ${(COURSE_PRICE * COMMISSION_RATE).toFixed(0)} per sale
              </span>
              .
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 space-y-3">
              <h3 className="text-sm sm:text-base font-semibold">How does the affiliate program work?</h3>
              <ul className="list-disc list-inside text-xs sm:text-sm text-gray-300 space-y-1.5">
                <li>Each partner gets a unique promo code (e.g. <span className="font-mono text-emerald-300">MOBUTU10</span>).</li>
                <li>Share your code with your audience (social media, community, email list, etc.).</li>
                <li>For every purchase made with your code, you receive a <b>{(COMMISSION_RATE * 100).toFixed(0)}%</b> commission.</li>
                <li>On a ${COURSE_PRICE} course, the commission is ${(COURSE_PRICE * COMMISSION_RATE).toFixed(0)} per sale.</li>
              </ul>
              <p className="text-[11px] sm:text-xs text-gray-400">
                Detailed tracking of sales, commissions and payouts is handled on the platform (database and
                payment system). This section explains the concept and estimated earnings for partners.
              </p>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="mt-3 w-full sm:w-auto px-4 py-2.5 rounded-lg bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 transition-colors"
              >
                Become an affiliate
              </button>
            </div>

            <AffiliateEarningsSimulator />
          </div>
        </section>

        {/* Section FAQ */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold">FAQ</h2>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl">
              Quick answers to the most common questions about the platform and the affiliate program.
            </p>
          </div>
          <div className="space-y-2">
            <FaqItem
              question="Who can become an affiliate?"
              answer="Anyone with a student account can request a promo code and start recommending the course to their audience."
            />
            <FaqItem
              question="How are commissions calculated?"
              answer="For every sale made with your code, a commission of 10% of the course price is calculated and linked to your affiliate profile in the database."
            />
            <FaqItem
              question="When and how are payments made?"
              answer="Payout schedule (monthly, quarterly, etc.) and payment method (bank transfer, mobile money, etc.) are set by the Mobutu Academy team and communicated to affiliates."
            />
          </div>
        </section>
      </main>
    </div>
  )
}

const AffiliateEarningsSimulator = () => {
  const [sales, setSales] = useState<number>(1)

  const earnings = sales > 0 ? sales * COURSE_PRICE * COMMISSION_RATE : 0

  return (
    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4 sm:p-5 space-y-4">
      <h3 className="text-sm sm:text-base font-semibold text-emerald-200">
        Estimate your earnings
      </h3>
      <div className="space-y-3">
        <label className="flex flex-col gap-1 text-xs sm:text-sm">
          <span className="text-gray-200">Number of sales made with your promo code</span>
          <input
            type="number"
            min={0}
            value={sales}
            onChange={(e) => setSales(Number(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-md bg-black/40 border border-emerald-500/40 text-sm outline-none focus:border-emerald-400"
          />
        </label>
        <div className="text-xs sm:text-sm text-gray-200 space-y-1">
          <p>
            You earn{' '}
            <span className="font-semibold text-emerald-300">
              {(COMMISSION_RATE * 100).toFixed(0)}% of ${COURSE_PRICE} = $
              {(COURSE_PRICE * COMMISSION_RATE).toFixed(0)} per sale.
            </span>
          </p>
          <p>
            For <span className="font-semibold">{sales}</span> sale(s), your estimated earnings:
          </p>
          <p className="text-lg sm:text-xl font-bold text-emerald-300">
            ${earnings.toFixed(0)} USD
          </p>
        </div>
      </div>
    </div>
  )
}

interface FaqItemProps {
  question: string
  answer: string
}

const FaqItem = ({ question, answer }: FaqItemProps) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 text-left"
      >
        <span className="text-sm font-semibold">{question}</span>
        <span className="ml-3 text-xs text-gray-400">
          {open ? '–' : '+'}
        </span>
      </button>
      {open && (
        <div className="px-4 sm:px-5 pb-4 text-xs sm:text-sm text-gray-300">
          {answer}
        </div>
      )}
    </div>
  )
}

export default LandingPage

