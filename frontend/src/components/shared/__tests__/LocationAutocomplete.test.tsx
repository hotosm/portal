import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import LocationAutocomplete from '../LocationAutocomplete'

vi.mock('../../../services/geocoder', () => ({
  searchLocations: vi.fn(async () => [{ label: 'Buenos Aires, Argentina' }]),
}))

// wa-input doesn't render in jsdom; a plain <input> keeps the same contract.
vi.mock('../Input', () => ({
  default: ({
    label,
    value,
    onInput,
    children,
  }: {
    label: string
    value: string
    onInput: (e: { currentTarget: { value: string } }) => void
    children?: React.ReactNode
  }) => (
    <>
      <input aria-label={label} value={value} onChange={onInput} />
      {children}
    </>
  ),
}))

afterEach(cleanup)

describe('LocationAutocomplete', () => {
  it('calls onChange with the label of the picked suggestion', async () => {
    const onChange = vi.fn()
    render(<LocationAutocomplete label="Location" value="" onChange={onChange} />)

    fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'buenos' } })
    fireEvent.click(await screen.findByText('Buenos Aires, Argentina'))

    expect(onChange).toHaveBeenCalledWith('Buenos Aires, Argentina')
  })

  it('marks typed text as dirty without calling onChange', async () => {
    const onChange = vi.fn()
    const onDirtyChange = vi.fn()
    render(
      <LocationAutocomplete
        label="Location"
        value=""
        onChange={onChange}
        onDirtyChange={onDirtyChange}
      />
    )

    fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'buenos' } })

    await waitFor(() => expect(onDirtyChange).toHaveBeenLastCalledWith(true))
    await screen.findByText('Buenos Aires, Argentina')
    expect(onChange).not.toHaveBeenCalled()
  })
})
