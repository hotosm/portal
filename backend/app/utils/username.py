def get_username(first_name: str | None, last_name: str | None, email: str | None) -> str | None:
    """The name to show for a user across Portal.

    "first_name last_name" (trimmed, skipping empty parts) when login has
    either; else the part of the email before the "@"; else None.
    """
    full_name = " ".join(part.strip() for part in (first_name, last_name) if part and part.strip())
    if full_name:
        return full_name
    local = (email or "").strip().split("@", 1)[0].strip()
    return local or None
