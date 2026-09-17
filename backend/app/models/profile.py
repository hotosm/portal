"""Pydantic schemas for the Profile feature."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

_BIO_MAX_LEN = 2_000
_LOCATION_MAX_LEN = 200
_CONTACT_EMAIL_MAX_LEN = 254
_PHONE_MAX_LEN = 32
_LINKEDIN_MAX_LEN = 500
_LINKEDIN_PATTERN = r"^https://([\w-]+\.)?linkedin\.com/.*$"
# Light shape check, not full RFC validation — avoids adding an email-validator
# dependency for this one field.
_EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

# bio is stored raw/unsanitized, same trust posture as Plan.description
# (see app/models/plan.py): whatever renders it must treat it as untrusted
# and never feed it to dangerouslySetInnerHTML without sanitizing at that point.


class ProfilePatch(BaseModel):
    """PATCH payload — portal_profiles fields only, all optional (partial update)."""

    bio: str | None = Field(default=None, max_length=_BIO_MAX_LEN)
    location: str | None = Field(default=None, max_length=_LOCATION_MAX_LEN)
    contact_email: str | None = Field(
        default=None, max_length=_CONTACT_EMAIL_MAX_LEN, pattern=_EMAIL_PATTERN
    )
    phone: str | None = Field(default=None, max_length=_PHONE_MAX_LEN)
    linkedin_url: str | None = Field(
        default=None, max_length=_LINKEDIN_MAX_LEN, pattern=_LINKEDIN_PATTERN
    )
    show_organizations: bool | None = None
    show_teams: bool | None = None


class PortalProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    bio: str | None
    location: str | None
    contact_email: str | None
    phone: str | None
    linkedin_url: str | None
    show_organizations: bool
    show_teams: bool
    created_at: datetime
    updated_at: datetime


class ProfileMeRead(BaseModel):
    """GET /api/profile/me response: account fields (live from login) + portal fields."""

    hanko_user_id: str
    first_name: str | None
    last_name: str | None
    picture_url: str | None
    slug: str | None
    is_public: bool
    osm_username: str | None
    osm_avatar_url: str | None
    portal: PortalProfileRead


class PublicProfileRead(BaseModel):
    """GET /api/public/profile/{slug} response."""

    slug: str
    first_name: str | None
    last_name: str | None
    picture_url: str | None
    bio: str | None
    location: str | None
    contact_email: str | None
    phone: str | None
    linkedin_url: str | None
    organizations: list[dict] | None = None
