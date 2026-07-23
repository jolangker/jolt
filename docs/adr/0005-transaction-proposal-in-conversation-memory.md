# Transaction Proposal lives only in conversation memory

A Transaction Proposal is not stored in the database. It exists only as Agent conversation turns (windowed, dropped after inactivity). If memory is gone, the User re-sends the photo. We rejected a persisted Proposal table and an in-process structured Map to avoid a new aggregate; natural-language confirm/edit is enough for v1.
