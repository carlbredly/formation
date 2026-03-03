import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import type { Course } from '../types/course'
import type { Enrollment } from '../types/course'
import { validateAccessCode } from '../lib/enrollments'
import { createPaymentRequest } from '../lib/payments'
import { getCourseThumbnailUrl } from '../lib/thumbnailUrl'

interface CourseCardProps {
  course: Course
  enrollment: Enrollment | null
}

const PAYMENT_INFO = {
  zelle: 'Send payment via Zelle to: [your-zelle-email]. Include your email and course name in the note.',
  moncash: 'Send payment via Mon Cash to: [your-moncash-id]. Include your email and course name.',
  other: 'Contact us for payment details. Include your email and course name.'
}

const CourseCard = ({ course, enrollment }: CourseCardProps) => {
  const navigate = useNavigate()
  const [showOverlay, setShowOverlay] = useState(false)
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [showPayModal, setShowPayModal] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'zelle' | 'moncash' | 'other'>('zelle')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [thumbnailError, setThumbnailError] = useState(false)

  const price = course.price ?? 0
  const thumbnailUrl = getCourseThumbnailUrl(course.thumbnail)
  const showThumbnail = thumbnailUrl && !thumbnailError
  const isEnrolled = !!enrollment

  const handleFollowCourse = () => {
    if (isEnrolled) {
      navigate(`/course/${course.id}`)
      return
    }
    setError('')
    setSuccess('')
    setShowAccessModal(true)
  }

  const handleSubmitAccessCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await validateAccessCode(course.id, accessCode)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setShowAccessModal(false)
    setAccessCode('')
    setPromoCode('')
    navigate(`/course/${course.id}`)
  }

  const handlePayCourse = () => {
    setError('')
    setSuccess('')
    setProofFile(null)
    setPaymentMethod('zelle')
    setShowPayModal(true)
  }

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!proofFile) return
    setError('')
    setLoading(true)
    const { error: err } = await createPaymentRequest({
      courseId: course.id,
      amount: price,
      paymentMethod,
      proofFile
    })
    setLoading(false)
    if (err) {
      setError(err.message || 'Failed to submit proof. Try again.')
      return
    }
    setSuccess('Proof submitted. You will get access once the payment is approved.')
    setProofFile(null)
    setTimeout(() => {
      setShowPayModal(false)
      setSuccess('')
    }, 2500)
  }

  return (
    <article
      className="group relative rounded-2xl border border-white/[0.06] bg-[#111] overflow-hidden transition-all duration-300 hover:border-white/10 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] hover:-translate-y-0.5"
      onMouseEnter={() => setShowOverlay(true)}
      onMouseLeave={() => setShowOverlay(false)}
    >
      {/* Thumbnail + price badge — clic pour afficher l’overlay (mobile / pas de hover) */}
      <div
        className="relative aspect-[16/10] overflow-hidden bg-[#0a0a0a] cursor-pointer"
        onClick={() => setShowOverlay(true)}
      >
        {showThumbnail ? (
          <img
            src={thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setThumbnailError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
            <svg className="w-12 h-12 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10">
          <span className="text-sm font-semibold text-white">${price.toFixed(0)}</span>
        </div>
        {isEnrolled && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30">
            <span className="text-xs font-medium text-emerald-300">Enrolled</span>
          </div>
        )}
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-black/40 flex flex-col items-center justify-end gap-3 p-5 transition-all duration-300 ${
            showOverlay ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={handleFollowCourse}
            className="w-full px-4 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-colors shadow-lg"
          >
            {isEnrolled ? 'Open course' : 'Follow the course'}
          </button>
          {!isEnrolled && (
            <button
              type="button"
              onClick={handlePayCourse}
              className="w-full px-4 py-2.5 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Pay for this course
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <h2 className="text-lg sm:text-xl font-semibold text-white leading-snug line-clamp-2">
          {course.title}
        </h2>
      </div>

      {/* Modales rendues dans document.body pour s’afficher en plein écran (pas à l’intérieur de la carte) */}
      {showAccessModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAccessModal(false)}
          >
            <div
              className="bg-[#141414] rounded-2xl border border-white/10 w-full max-w-sm p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white mb-1">Follow the course</h3>
              <p className="text-sm text-gray-400 mb-5">Enter your access code to unlock this course.</p>
              <form onSubmit={handleSubmitAccessCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Promo code (optional)</label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                    placeholder="e.g. MOBUTU10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Access code *</label>
                  <input
                    type="text"
                    value={accessCode}
                    onChange={e => setAccessCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
                    placeholder="Your course access code"
                    required
                  />
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAccessModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Checking...' : 'Continue'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {showPayModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowPayModal(false)}
          >
            <div
              className="bg-[#141414] rounded-2xl border border-white/10 w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white mb-1">Pay for this course</h3>
              <p className="text-sm text-gray-400 mb-5">
                Amount: <span className="font-semibold text-white">${price.toFixed(0)}</span> — Zelle or Mon Cash. Send proof to get access after confirmation.
              </p>
              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Payment method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as 'zelle' | 'moncash' | 'other')}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="zelle">Zelle</option>
                    <option value="moncash">Mon Cash</option>
                    <option value="other">Other</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">{PAYMENT_INFO[paymentMethod]}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Proof of payment *</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={e => setProofFile(e.target.files?.[0] ?? null)}
                    className="w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-500/20 file:text-emerald-300 file:text-sm file:font-medium"
                  />
                </div>
                {error && <p className="text-xs text-red-400">{error}</p>}
                {success && <p className="text-xs text-emerald-400">{success}</p>}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPayModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !proofFile}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Submitting...' : 'Submit proof'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </article>
  )
}

export default CourseCard
