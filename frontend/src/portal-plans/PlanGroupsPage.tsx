import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import Button from "../components/shared/Button";
import Dialog from "../components/shared/Dialog";
import Icon from "../components/shared/Icon";
import Option from "../components/shared/Option";
import PageWrapper from "../components/shared/PageWrapper";
import Select from "../components/shared/Select";
import Spinner from "../components/shared/Spinner";
import SubSectionHeader from "../components/shared/SubSectionHeader";
import Tag from "../components/shared/Tag";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { m } from "../paraglide/messages";
import { APP_META } from "../utils/appMeta";
import PlanSectionHeader from "./components/PlanSectionHeader";
import {
  useCreateProjectGroup,
  useCreateProjectTag,
  useDeleteProjectGroup,
  useDeleteProjectTag,
  useMyGroups,
  usePlan,
  useProjectGroups,
  useProjectTags,
  useSetProjectGroups,
  useSetProjectTags,
  useUpdateProjectGroup,
  useUpdateProjectTag,
} from "./hooks";
import type {
  GroupType,
  HydratedProjectItem,
  ProjectGroup,
  ProjectTag,
} from "./types";

/** Ownership scope of a new group/tag, mirroring PlanPermissionsDialog. */
type Scope = "personal" | GroupType;

/** Read the selected value from a Web Awesome `<wa-select>` change event. */
function selectValue(event: unknown): string {
  return (event as { target: { value?: string } }).target?.value ?? "";
}

/**
 * Best-effort display name for a plan row. Deliberately simpler than
 * PlanProjectCard's usePlanProjectDisplay — this page lists rows to attach
 * taxonomies to, so it doesn't need the card's image/href resolution or its
 * extra ChatMap title fetch.
 */
function rowTitle(project: HydratedProjectItem): string {
  const src = project.upstream ?? project.data;
  const raw = src?.name ?? src?.title ?? src?.project_name;
  if (typeof raw === "string" && raw) return raw;
  return project.project_id ?? m.plan_groups_untitled();
}

interface ScopeFieldProps {
  scope: Scope;
  groupId: string | null;
  onScopeChange: (scope: Scope) => void;
  onGroupIdChange: (groupId: string | null) => void;
}

/**
 * Scope picker for a new group/tag: personal, or shared with one of the user's
 * login teams/organizations. Renders nothing when the user has no memberships,
 * in which case everything they create is personal.
 */
function ScopeField({
  scope,
  groupId,
  onScopeChange,
  onGroupIdChange,
}: ScopeFieldProps) {
  const { data: userGroups = [] } = useMyGroups();
  const teamGroups = userGroups.filter((g) => g.type === "team");
  const orgGroups = userGroups.filter((g) => g.type === "organization");
  if (userGroups.length === 0) return null;

  const scopeGroups = scope === "team" ? teamGroups : orgGroups;

  return (
    <>
      <Select
        label={m.plan_groups_scope_label()}
        value={scope}
        onChange={(e) => {
          const next = selectValue(e) as Scope;
          onScopeChange(next);
          if (next === "personal") {
            onGroupIdChange(null);
            return;
          }
          const list = next === "team" ? teamGroups : orgGroups;
          onGroupIdChange(list[0]?.id ?? null);
        }}
      >
        <Option value="personal">{m.plan_groups_scope_personal()}</Option>
        {teamGroups.length > 0 && (
          <Option value="team">{m.plan_groups_scope_team()}</Option>
        )}
        {orgGroups.length > 0 && (
          <Option value="organization">{m.plan_groups_scope_org()}</Option>
        )}
      </Select>
      {scope !== "personal" && (
        <Select
          label={m.plan_groups_scope_which_label()}
          value={groupId ?? ""}
          onChange={(e) => onGroupIdChange(selectValue(e) || null)}
        >
          {scopeGroups.map((g) => (
            <Option key={g.id} value={g.id}>
              {g.name}
            </Option>
          ))}
        </Select>
      )}
    </>
  );
}

interface TaxonomyRowProps {
  entity: ProjectGroup | ProjectTag;
  description?: string | null;
  isSaving: boolean;
  onRename: (name: string, description: string | null) => void;
  onDelete: () => void;
}

/** One group/tag in the management list, with inline rename and delete. */
function TaxonomyRow({
  entity,
  description,
  isSaving,
  onRename,
  onDelete,
}: TaxonomyRowProps) {
  // `description === undefined` marks a tag (no description field at all),
  // distinct from a group whose description is null.
  const hasDescription = description !== undefined;
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(entity.name);
  const [desc, setDesc] = useState(description ?? "");

  function startEditing() {
    setName(entity.name);
    setDesc(description ?? "");
    setEditing(true);
  }

  function save() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onRename(trimmed, hasDescription ? desc.trim() || null : null);
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="flex flex-col gap-sm border border-hot-gray-300 rounded-lg p-md">
        <input
          type="text"
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setEditing(false);
          }}
          className="border border-hot-gray-300 rounded-lg px-md py-sm text-base outline-none focus:border-hot-red-500"
        />
        {hasDescription && (
          <textarea
            value={desc}
            rows={2}
            placeholder={m.plan_groups_description_placeholder()}
            onChange={(e) => setDesc(e.target.value)}
            className="border border-hot-gray-300 rounded-lg px-md py-sm text-sm outline-none focus:border-hot-red-500 resize-y"
          />
        )}
        <div className="flex gap-sm justify-end">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-sm text-hot-gray-500 hover:text-hot-gray-700 underline"
          >
            {m.plan_cancel()}
          </button>
          <Button
            type="button"
            size="small"
            onClick={save}
            disabled={isSaving || !name.trim()}
          >
            {m.plan_groups_save()}
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-start gap-sm border border-hot-gray-300 rounded-lg p-md">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-xs flex-wrap">
          <span className="font-medium break-words">{entity.name}</span>
          {entity.group_id && (
            <Tag variant="neutral" appearance="outlined" size="small">
              {m.plan_groups_shared_tag()}
            </Tag>
          )}
        </div>
        {description && (
          <p className="text-sm text-hot-gray-600 mt-xs break-words">
            {description}
          </p>
        )}
      </div>
      {isSaving && <Spinner />}
      <button
        type="button"
        onClick={startEditing}
        aria-label={m.plan_groups_rename()}
        className="text-hot-gray-500 hover:text-hot-gray-700"
      >
        <Icon library="bootstrap" name="pencil" label={m.plan_groups_rename()} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={m.plan_groups_delete()}
        className="text-hot-gray-500 hover:text-hot-red-600"
      >
        <Icon library="bootstrap" name="trash" label={m.plan_groups_delete()} />
      </button>
    </li>
  );
}

interface ChipPickerProps {
  label: string;
  options: { id: string; name: string }[];
  selected: Set<string>;
  disabled: boolean;
  emptyHint: string;
  onToggle: (id: string) => void;
}

/**
 * Toggleable chips for assigning groups/tags to a plan row. Chips rather than a
 * multi-`<wa-select>`: assignments are usually one or two clicks and stay
 * readable at a glance next to every project.
 */
function ChipPicker({
  label,
  options,
  selected,
  disabled,
  emptyHint,
  onToggle,
}: ChipPickerProps) {
  return (
    <div className="flex flex-col gap-xs">
      <span className="text-xs font-medium text-hot-gray-500 uppercase tracking-wide">
        {label}
      </span>
      {options.length === 0 ? (
        <span className="text-sm text-hot-gray-500">{emptyHint}</span>
      ) : (
        <div className="flex flex-wrap gap-xs">
          {options.map((option) => {
            const isSelected = selected.has(option.id);
            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled}
                onClick={() => onToggle(option.id)}
                aria-pressed={isSelected}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Tag
                  variant={isSelected ? "brand" : "neutral"}
                  appearance={isSelected ? "filled" : "outlined"}
                  size="small"
                >
                  {option.name}
                </Tag>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PlanGroupsPage() {
  const { planId } = useParams<{ planId: string }>();
  const { isLogin, isAuthLoading } = useAuth();
  const { currentLanguage } = useLanguage();

  const { data: plan, isLoading: planLoading, isError: planError } = usePlan(
    planId ?? "",
  );
  const { data: groups = [], isLoading: groupsLoading } = useProjectGroups();
  const { data: tags = [], isLoading: tagsLoading } = useProjectTags();

  const createGroup = useCreateProjectGroup();
  const updateGroup = useUpdateProjectGroup();
  const deleteGroup = useDeleteProjectGroup();
  const createTag = useCreateProjectTag();
  const updateTag = useUpdateProjectTag();
  const deleteTag = useDeleteProjectTag();
  const setProjectGroups = useSetProjectGroups(planId ?? "");
  const setProjectTags = useSetProjectTags(planId ?? "");

  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [groupScope, setGroupScope] = useState<Scope>("personal");
  const [groupScopeId, setGroupScopeId] = useState<string | null>(null);

  const [tagName, setTagName] = useState("");
  const [tagScope, setTagScope] = useState<Scope>("personal");
  const [tagScopeId, setTagScopeId] = useState<string | null>(null);

  // Which entity a delete confirmation is open for, if any.
  const [pendingDelete, setPendingDelete] = useState<
    { kind: "group" | "tag"; id: string; name: string } | null
  >(null);

  const canEdit = plan?.can_edit ?? false;
  const isLoading = isAuthLoading || planLoading;

  function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    const name = groupName.trim();
    if (!name) return;
    createGroup.mutate(
      {
        name,
        description: groupDesc.trim() || null,
        group_type: groupScope === "personal" ? null : groupScope,
        group_id: groupScope === "personal" ? null : groupScopeId,
      },
      {
        onSuccess: () => {
          setGroupName("");
          setGroupDesc("");
          toast.success(m.plan_groups_toast_group_created());
        },
      },
    );
  }

  function handleCreateTag(e: React.FormEvent) {
    e.preventDefault();
    const name = tagName.trim();
    if (!name) return;
    createTag.mutate(
      {
        name,
        group_type: tagScope === "personal" ? null : tagScope,
        group_id: tagScope === "personal" ? null : tagScopeId,
      },
      {
        onSuccess: () => {
          setTagName("");
          toast.success(m.plan_groups_toast_tag_created());
        },
      },
    );
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    const { kind, id } = pendingDelete;
    const mutation = kind === "group" ? deleteGroup : deleteTag;
    mutation.mutate(id, {
      onSuccess: () => {
        setPendingDelete(null);
        toast.success(
          kind === "group"
            ? m.plan_groups_toast_group_deleted()
            : m.plan_groups_toast_tag_deleted(),
        );
      },
    });
  }

  // Assignment endpoints replace the whole set, so toggling means sending the
  // current ids with one added or removed.
  function toggleGroupOnProject(project: HydratedProjectItem, groupId: string) {
    const current = project.groups.map((g) => g.id);
    const next = current.includes(groupId)
      ? current.filter((id) => id !== groupId)
      : [...current, groupId];
    setProjectGroups.mutate({ planProjectId: project.id, groupIds: next });
  }

  function toggleTagOnProject(project: HydratedProjectItem, tagId: string) {
    const current = project.tags.map((t) => t.id);
    const next = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];
    setProjectTags.mutate({ planProjectId: project.id, tagIds: next });
  }

  if (!isLoading && planError) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center">
          <h3 className="py-xl">{m.plan_load_error()}</h3>
        </div>
      </PageWrapper>
    );
  }

  if (!isLoading && !plan) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center">
          <h3 className="py-xl">
            {isLogin ? m.plan_not_found() : m.plan_private()}
          </h3>
        </div>
      </PageWrapper>
    );
  }

  return (
    <>
      <PlanSectionHeader
        breadcrumbs={
          isLoading
            ? undefined
            : [
                { label: m.plan_header(), href: `/${currentLanguage}/plan` },
                {
                  label: plan!.name,
                  href: `/${currentLanguage}/plan/${plan!.id}`,
                },
                { label: m.plan_groups_header() },
              ]
        }
      >
        {isLoading ? (
          <div className="animate-pulse bg-hot-gray-300 rounded h-6 w-48" />
        ) : (
          m.plan_groups_header()
        )}
      </PlanSectionHeader>

      <PageWrapper>
        <p className="text-sm text-hot-gray-600 py-md">
          {m.plan_groups_intro()}
        </p>
      </PageWrapper>

      {/* Taxonomy management — groups and tags are owned by the user (or shared
          with a team/org), so edits here affect every plan that uses them. */}
      <SubSectionHeader title={`<strong>${m.plan_groups_section_groups()}</strong>`} />
      <PageWrapper>
        <div className="flex flex-col gap-md py-lg max-w-2xl">
          <form onSubmit={handleCreateGroup} className="flex flex-col gap-sm">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={m.plan_groups_new_group_placeholder()}
              className="border border-hot-gray-300 rounded-lg px-md py-sm text-base outline-none focus:border-hot-red-500"
            />
            <textarea
              value={groupDesc}
              rows={2}
              onChange={(e) => setGroupDesc(e.target.value)}
              placeholder={m.plan_groups_description_placeholder()}
              className="border border-hot-gray-300 rounded-lg px-md py-sm text-sm outline-none focus:border-hot-red-500 resize-y"
            />
            <ScopeField
              scope={groupScope}
              groupId={groupScopeId}
              onScopeChange={setGroupScope}
              onGroupIdChange={setGroupScopeId}
            />
            <div>
              <Button
                type="submit"
                disabled={createGroup.isPending || !groupName.trim()}
              >
                <Icon slot="start" library="bootstrap" name="plus" />
                {createGroup.isPending
                  ? m.plan_groups_adding()
                  : m.plan_groups_add()}
              </Button>
            </div>
          </form>

          {groupsLoading ? (
            <Spinner label={m.plan_form_loading()} />
          ) : groups.length === 0 ? (
            <p className="text-sm text-hot-gray-500">
              {m.plan_groups_empty_groups()}
            </p>
          ) : (
            <ul className="flex flex-col gap-sm">
              {groups.map((group) => (
                <TaxonomyRow
                  key={group.id}
                  entity={group}
                  description={group.description}
                  isSaving={
                    updateGroup.isPending && updateGroup.variables?.id === group.id
                  }
                  onRename={(name, description) =>
                    updateGroup.mutate(
                      { id: group.id, payload: { name, description } },
                      {
                        onSuccess: () =>
                          toast.success(m.plan_groups_toast_group_updated()),
                      },
                    )
                  }
                  onDelete={() =>
                    setPendingDelete({
                      kind: "group",
                      id: group.id,
                      name: group.name,
                    })
                  }
                />
              ))}
            </ul>
          )}
        </div>
      </PageWrapper>

      <SubSectionHeader title={`<strong>${m.plan_groups_section_tags()}</strong>`} />
      <PageWrapper>
        <div className="flex flex-col gap-md py-lg max-w-2xl">
          <form onSubmit={handleCreateTag} className="flex flex-col gap-sm">
            <input
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder={m.plan_groups_new_tag_placeholder()}
              className="border border-hot-gray-300 rounded-lg px-md py-sm text-base outline-none focus:border-hot-red-500"
            />
            <ScopeField
              scope={tagScope}
              groupId={tagScopeId}
              onScopeChange={setTagScope}
              onGroupIdChange={setTagScopeId}
            />
            <div>
              <Button
                type="submit"
                disabled={createTag.isPending || !tagName.trim()}
              >
                <Icon slot="start" library="bootstrap" name="plus" />
                {createTag.isPending
                  ? m.plan_groups_adding()
                  : m.plan_groups_add()}
              </Button>
            </div>
          </form>

          {tagsLoading ? (
            <Spinner label={m.plan_form_loading()} />
          ) : tags.length === 0 ? (
            <p className="text-sm text-hot-gray-500">
              {m.plan_groups_empty_tags()}
            </p>
          ) : (
            <ul className="flex flex-col gap-sm">
              {tags.map((tag) => (
                <TaxonomyRow
                  key={tag.id}
                  entity={tag}
                  isSaving={updateTag.isPending && updateTag.variables?.id === tag.id}
                  onRename={(name) =>
                    updateTag.mutate(
                      { id: tag.id, payload: { name } },
                      {
                        onSuccess: () =>
                          toast.success(m.plan_groups_toast_tag_updated()),
                      },
                    )
                  }
                  onDelete={() =>
                    setPendingDelete({ kind: "tag", id: tag.id, name: tag.name })
                  }
                />
              ))}
            </ul>
          )}
        </div>
      </PageWrapper>

      {/* Assignment — which groups/tags each project in *this* plan carries. */}
      <SubSectionHeader title={`<strong>${m.plan_groups_section_assign()}</strong>`} />
      <PageWrapper>
        <div className="flex flex-col gap-md py-lg">
          {isLoading ? (
            <Spinner label={m.plan_form_loading()} />
          ) : plan!.projects.length === 0 ? (
            <p className="text-sm text-hot-gray-500">
              {m.plan_groups_no_projects()}
            </p>
          ) : (
            plan!.projects.map((project) => (
              <div
                key={project.id}
                className="flex flex-col gap-sm border border-hot-gray-300 rounded-lg p-md"
              >
                <div className="flex items-center gap-xs flex-wrap">
                  <span className="text-sm text-hot-gray-600">
                    {APP_META[project.app]?.name ?? project.app}
                  </span>
                  <span className="font-medium break-words">
                    {rowTitle(project)}
                  </span>
                  {project.groups.length === 0 && (
                    <Tag variant="neutral" appearance="outlined" size="small">
                      {m.plan_groups_all_bucket()}
                    </Tag>
                  )}
                </div>
                <ChipPicker
                  label={m.plan_groups_assign_groups_label()}
                  options={groups}
                  selected={new Set(project.groups.map((g) => g.id))}
                  disabled={!canEdit || setProjectGroups.isPending}
                  emptyHint={m.plan_groups_empty_groups()}
                  onToggle={(groupId) => toggleGroupOnProject(project, groupId)}
                />
                <ChipPicker
                  label={m.plan_groups_assign_tags_label()}
                  options={tags}
                  selected={new Set(project.tags.map((t) => t.id))}
                  disabled={!canEdit || setProjectTags.isPending}
                  emptyHint={m.plan_groups_empty_tags()}
                  onToggle={(tagId) => toggleTagOnProject(project, tagId)}
                />
              </div>
            ))
          )}
        </div>
      </PageWrapper>

      <Dialog
        open={pendingDelete !== null}
        label={
          pendingDelete?.kind === "tag"
            ? m.plan_groups_delete_tag_label()
            : m.plan_groups_delete_group_label()
        }
        onWaHide={(e: Event) => {
          if (e.target === e.currentTarget) setPendingDelete(null);
        }}
      >
        <p>
          <strong className="break-words">{pendingDelete?.name}</strong>
          {" — "}
          {pendingDelete?.kind === "tag"
            ? m.plan_groups_delete_tag_message()
            : m.plan_groups_delete_group_message()}
        </p>
        <div slot="footer" className="flex gap-sm justify-end">
          <button
            type="button"
            onClick={() => setPendingDelete(null)}
            className="text-sm text-hot-gray-500 hover:text-hot-gray-700 underline"
          >
            {m.plan_cancel()}
          </button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirmDelete}
            disabled={deleteGroup.isPending || deleteTag.isPending}
          >
            {m.plan_groups_delete()}
          </Button>
        </div>
      </Dialog>
    </>
  );
}

export default PlanGroupsPage;
