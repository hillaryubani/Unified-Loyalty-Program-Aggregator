;; Loyalty Program Registry Contract

(define-map loyalty-programs
  { program-id: uint }
  {
    name: (string-utf8 100),
    token-contract: principal,
    exchange-rate: uint
  }
)

(define-data-var next-program-id uint u1)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-public (register-program (name (string-utf8 100)) (token-contract principal) (exchange-rate uint))
  (let
    (
      (program-id (var-get next-program-id))
    )
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set loyalty-programs
      { program-id: program-id }
      {
        name: name,
        token-contract: token-contract,
        exchange-rate: exchange-rate
      }
    )
    (var-set next-program-id (+ program-id u1))
    (ok program-id)
  )
)

(define-public (update-exchange-rate (program-id uint) (new-exchange-rate uint))
  (let
    (
      (program (unwrap! (map-get? loyalty-programs { program-id: program-id }) err-not-found))
    )
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set loyalty-programs
      { program-id: program-id }
      (merge program { exchange-rate: new-exchange-rate })
    ))
  )
)

(define-read-only (get-program (program-id uint))
  (ok (unwrap! (map-get? loyalty-programs { program-id: program-id }) err-not-found))
)

(define-read-only (get-exchange-rate (program-id uint))
  (ok (get exchange-rate (unwrap! (map-get? loyalty-programs { program-id: program-id }) err-not-found)))
)

