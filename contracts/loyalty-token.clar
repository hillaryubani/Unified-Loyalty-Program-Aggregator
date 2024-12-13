;; Loyalty Token Contract

(define-fungible-token loyalty-token)

(define-data-var token-uri (string-utf8 256) u"https://example.com/loyalty-token-metadata")

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ft-mint? loyalty-token amount recipient)
  )
)

(define-public (transfer (amount uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-authorized)
    (ft-transfer? loyalty-token amount sender recipient)
  )
)

(define-read-only (get-balance (account principal))
  (ok (ft-get-balance loyalty-token account))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply loyalty-token))
)

(define-read-only (get-token-uri)
  (ok (var-get token-uri))
)

(define-public (set-token-uri (new-uri (string-utf8 256)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (var-set token-uri new-uri))
  )
)
