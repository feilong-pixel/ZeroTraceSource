-- SPDX-License-Identifier: MIT

CREATE TABLE sample_policy (
    id INTEGER PRIMARY KEY,
    safety_strategy VARCHAR(32) NOT NULL,
    archive_flag INTEGER DEFAULT 0,
    approve_status VARCHAR(32),
    updated_at TIMESTAMP
);

CREATE INDEX idx_sample_policy_safety_strategy
    ON sample_policy (safety_strategy);

CREATE INDEX idx_sample_policy_approve_status
    ON sample_policy (approve_status);
