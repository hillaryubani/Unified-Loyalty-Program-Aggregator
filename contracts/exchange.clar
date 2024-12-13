;; Exchange Contract

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-invalid-amount (err u102))

(define-public (exchange-points
  (from-program-id uint)
  (to-program-id uint)
  (amount uint)
)
  (let
    (
      (from-program (unwrap! (contract-call? .loyalty-program-registry get-program from-program-id) err-not-authorized))
      (to-program (unwrap! (contract-call? .loyalty-program-registry get-program to-program-id) err-not-authorized))
      (from-rate (unwrap! (contract-call? .loyalty-program-registry get-exchange-rate from-program-id) err-not-authorized))
      (to-rate (unwrap! (contract-call? .loyalty-program-registry get-exchange-rate to-program-id) err-not-authorized))
      (converted-amount (/ (* amount to-rate) from-rate))
    )
    (asserts! (> converted-amount u0) err-invalid-amount)
    (try! (contract-call? .loyalty-token transfer amount tx-sender (as-contract tx-sender)))
    (try! (contract-call? .loyalty-token transfer converted-amount (as-contract tx-sender) tx-sender))
    (ok converted-amount)
  )
)

