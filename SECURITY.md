# Security

Please do not disclose vulnerabilities in a public issue. Use GitHub's private
vulnerability reporting for this repository. Include reproduction steps,
affected routes or SDK versions, and the impact you observed.

TokenLens stores API-key hashes rather than plaintext keys, enforces Supabase
row-level security, verifies payment webhook signatures, and blocks private
network destinations for user-configured webhooks.
