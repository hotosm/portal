import { useEffect, useRef, useState } from 'react'
import { m } from '../../paraglide/messages'
import { type LocationSuggestion, searchLocations } from '../../services/geocoder'
import Input from './Input'
import Spinner from './Spinner'

const DEBOUNCE_MS = 350
const MIN_QUERY_LENGTH = 2

interface LocationAutocompleteProps {
  /** The confirmed value: a picked suggestion, or whatever was saved before. */
  value: string
  /** Fires only when a suggestion is picked, or with '' when the field is cleared. */
  onChange: (label: string) => void
  /** True while the typed text is neither empty nor the confirmed value. */
  onDirtyChange?: (dirty: boolean) => void
  label: string
}

/**
 * Location field with debounced geocoder suggestions: type, then click one to
 * confirm it. Typed text alone never becomes the value.
 */
function LocationAutocomplete({
  value,
  onChange,
  onDirtyChange,
  label,
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState<string>(value)
  const [results, setResults] = useState<LocationSuggestion[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)
  const [failed, setFailed] = useState<boolean>(false)

  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const justPickedRef = useRef(false)

  const dirty = query.trim() !== '' && query !== value

  useEffect(() => {
    onDirtyChange?.(dirty)
  }, [dirty, onDirtyChange])

  // Debounced suggestion fetch.
  useEffect(() => {
    if (justPickedRef.current) {
      justPickedRef.current = false
      return
    }
    clearTimeout(debounceRef.current)
    // The prefilled value (or a picked one) needs no suggestions.
    if (query.trim().length < MIN_QUERY_LENGTH || query === value) {
      abortRef.current?.abort()
      setLoading(false)
      setResults([])
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(() => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setLoading(true)
      setFailed(false)
      searchLocations(query.trim(), controller.signal)
        .then((r) => {
          if (controller.signal.aborted) return
          setResults(r)
          setOpen(true)
        })
        .catch(() => {
          if (controller.signal.aborted) return
          setResults([])
          setOpen(false)
          setFailed(true)
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false)
        })
    }, DEBOUNCE_MS)
    return () => clearTimeout(debounceRef.current)
  }, [query, value])

  useEffect(() => () => abortRef.current?.abort(), [])

  const handleInput = (next: string) => {
    setQuery(next)
    setFailed(false)
    if (next.trim() === '' && value !== '') onChange('')
  }

  const handlePick = (result: LocationSuggestion) => {
    justPickedRef.current = true
    clearTimeout(debounceRef.current)
    abortRef.current?.abort()
    setLoading(false)
    setQuery(result.label)
    setResults([])
    setOpen(false)
    onChange(result.label)
  }

  return (
    <div className="relative">
      <Input
        type="text"
        size="small"
        label={label}
        className="visually-hidden-label"
        placeholder={m.profile_location_placeholder()}
        value={query}
        onInput={(e) => handleInput(e.currentTarget.value ?? '')}
        onFocus={() => results.length > 0 && setOpen(true)}
        onKeyDown={(e) => {
          // An open list swallows Escape; closed, it bubbles up to the editor.
          if (e.key === 'Escape' && open) {
            e.stopPropagation()
            setOpen(false)
          }
        }}
      >
        {loading && (
          <span slot="end" className="flex">
            <Spinner />
          </span>
        )}
      </Input>

      {open && (
        <ul className="absolute top-full text-left mt-3xs left-0 right-0 z-10 m-0 p-0 list-none bg-white rounded-md shadow-lg border border-hot-gray-200 overflow-hidden max-h-60 overflow-y-auto">
          {results.length > 0 ? (
            results.map((r) => (
              <li className="ml-xs" key={r.label}>
                {/* Most of these undo Web Awesome's native <button> styles, which
                    text-left can't reach: it centres its content (justify-start),
                    fixes its height (h-auto) and styles it as an action. The
                    ellipsis needs its own min-w-0 child inside the flex button. */}
                <button
                  type="button"
                  onClick={() => handlePick(r)}
                  className="w-full min-w-0 h-auto justify-start text-left px-xs py-2xs text-sm font-normal text-hot-gray-950 bg-transparent border-0 rounded-none shadow-none hover:bg-hot-gray-50 cursor-pointer"
                  title={r.label}
                >
                  <span className="truncate">{r.label}</span>
                </button>
              </li>
            ))
          ) : (
            <li className="px-xs py-2xs text-sm text-hot-gray-600">
              {m.profile_location_no_results()}
            </li>
          )}
        </ul>
      )}

      {failed && (
        <p className="text-xs text-hot-red-600 mt-3xs mb-0">{m.profile_location_error()}</p>
      )}
    </div>
  )
}

export default LocationAutocomplete
