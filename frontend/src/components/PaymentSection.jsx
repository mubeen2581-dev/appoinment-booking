import { forwardRef, useImperativeHandle, useState } from "react"
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"

export const PaymentSection = forwardRef(({ clientSecret }, ref) => {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useImperativeHandle(ref, () => ({
    async confirm() {
      if (!stripe || !elements) {
        throw new Error("Payment is not ready yet")
      }

      setLoading(true)
      setError(null)

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: "if_required",
      })

      setLoading(false)

      if (result.error) {
        setError(result.error.message ?? "Payment failed")
        throw new Error(result.error.message ?? "Payment failed")
      }

      return { paymentIntentId: result.paymentIntent?.id ?? null }
    },
  }))

  if (!clientSecret) {
    return (
      <div className="card-surface rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-md dark:border-slate-700/60 dark:bg-slate-900/75 dark:shadow-xl">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-100">Payment</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Preparing secure payment form...</p>
      </div>
    )
  }

  return (
    <div className="card-surface rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-md dark:border-slate-700/60 dark:bg-slate-900/75 dark:shadow-xl">
      <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-100">Payment</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Securely pay for your appointment to confirm the booking.
      </p>
      <div className="mt-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700 dark:bg-slate-900">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>
      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      {loading ? <p className="mt-3 text-sm text-slate-500">Processing payment...</p> : null}
    </div>
  )
})

export const NoPaymentCard = ({ hasPrice }) => (
  <div className="card-surface rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-md dark:border-slate-700/60 dark:bg-slate-900/75 dark:shadow-xl">
    <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-100">Payment</h2>
    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
      {hasPrice
        ? "Collect payment on-site. Online payments are disabled."
        : "No upfront payment required for this service."}
    </p>
  </div>
)


