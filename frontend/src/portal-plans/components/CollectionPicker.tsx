import Dropdown from '../../components/shared/Dropdown'
import DropdownItem from '../../components/shared/DropdownItem'
import Spinner from '../../components/shared/Spinner'
import Tag from '../../components/shared/Tag'
import { m } from '../../paraglide/messages'
import { useCollections } from '../hooks'

interface CollectionPickerProps {
  /** Plan the collections belong to. */
  planId: string
  /** Assigned collection, or null for the virtual "All" bucket (no collection). */
  value: string | null
  /** Picking the assigned collection again clears it, reporting null. */
  onChange: (collectionId: string | null) => void
  /** Show a spinner next to the trigger while the choice is being saved. */
  isPending?: boolean
}

/**
 * Single-collection picker: a project belongs to one collection of its plan,
 * or to none ("All").
 */
function CollectionPicker({ planId, value, onChange, isPending }: CollectionPickerProps) {
  const { data: collections = [] } = useCollections(planId)
  const assigned = collections.find((c) => c.id === value) ?? null

  function handleSelect(event: CustomEvent) {
    const id = event.detail.item.value as string | undefined
    if (!id) return
    onChange(value === id ? null : id)
  }

  return (
    <div className="flex flex-col gap-xs">
      <span className="text-xs font-medium text-hot-gray-500 uppercase tracking-wide">
        {m.plan_collections_assign_collection_label()}
      </span>
      <div className="flex items-center gap-xs flex-wrap">
        <Dropdown onSelect={handleSelect}>
          <Tag
            slot="trigger"
            variant={assigned ? 'brand' : 'neutral'}
            appearance={assigned ? 'filled' : 'outlined'}
            size="small"
            className="cursor-pointer"
          >
            {assigned ? assigned.name : m.plan_project_add_to_collection()} ▾
          </Tag>
          {collections.length === 0 ? (
            <DropdownItem disabled>{m.plan_collections_empty_collections()}</DropdownItem>
          ) : (
            collections.map((collection) => (
              <DropdownItem
                key={collection.id}
                value={collection.id}
                type="checkbox"
                checked={value === collection.id}
              >
                {collection.name}
              </DropdownItem>
            ))
          )}
        </Dropdown>
        {isPending && <Spinner />}
      </div>
    </div>
  )
}

export default CollectionPicker
