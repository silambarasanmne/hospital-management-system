CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token INTEGER UNIQUE NOT NULL,
    patient_name TEXT NOT NULL,
    age INTEGER NOT NULL,
    mobile TEXT NOT NULL,
    symptoms TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patients_token ON patients(token);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(patient_name);
