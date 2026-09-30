"""Pydantic schemas for the Profile feature."""

from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, field_validator

_BIO_MAX_LEN = 2_000
_LOCATION_MAX_LEN = 200
_CONTACT_EMAIL_MAX_LEN = 254
_PHONE_MAX_LEN = 32
_LINKEDIN_MAX_LEN = 500
_LINKEDIN_PATTERN = r"^https://([\w-]+\.)?linkedin\.com/.*$"
_EXTRA_LINKS_MAX = 4
_EXTRA_LINK_MAX_LEN = 500
_EXTRA_LINK_PATTERN = r"^https://[^\s/$.?#].[^\s]*$"
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
    # Replaces the whole list when present; [] (or null) empties it.
    extra_links: (
        list[Annotated[str, Field(max_length=_EXTRA_LINK_MAX_LEN, pattern=_EXTRA_LINK_PATTERN)]]
        | None
    ) = Field(default=None, max_length=_EXTRA_LINKS_MAX)
    show_organizations: bool | None = None
    show_teams: bool | None = None

    @field_validator("extra_links", mode="before")
    @classmethod
    def _clean_extra_links(cls, value: object) -> object:
        # Strip and drop blanks before the per-item pattern and the list cap run.
        if not isinstance(value, list):
            return value
        cleaned = [item.strip() if isinstance(item, str) else item for item in value]
        return [item for item in cleaned if item != ""]

    @field_validator("extra_links")
    @classmethod
    def _unique_extra_links(cls, value: list[str] | None) -> list[str]:
        # The column is NOT NULL, so an explicit null means "no links".
        if value is None:
            return []
        if len(set(value)) != len(value):
            raise ValueError("extra_links must not contain duplicates")
        return value


class PortalProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    bio: str | None
    location: str | None
    contact_email: str | None
    phone: str | None
    linkedin_url: str | None
    extra_links: list[str]
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
    # Contact details stay out of this payload (anti-scraping); visitors fetch
    # them on demand from GET /api/public/profile/{slug}/contact.
    has_contact: bool
    organizations: list[dict] | None = None
    teams: list[dict] | None = None


class PublicContactRead(BaseModel):
    """GET /api/public/profile/{slug}/contact response."""

    contact_email: str | None
    phone: str | None
    linkedin_url: str | None
    extra_links: list[str]
