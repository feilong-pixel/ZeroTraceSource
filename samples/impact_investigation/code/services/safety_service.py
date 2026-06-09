# SPDX-License-Identifier: MIT

SAFETY_DEFAULT = "safetyStrategy"


def build_safety_strategy(user_status, approve_status):
    """安全方針を判定するサンプル処理。"""
    if approve_status == "approved":
        return {"safetyStrategy": "enabled", "reason": "承認状態 is approved"}

    if user_status == "inactive":
        return {"safetyStrategy": "limited", "reason": "user is inactive"}

    return {"safetyStrategy": "review", "reason": "manual confirmation required"}


def should_archive_record(archive_flag):
    return bool(archive_flag)
