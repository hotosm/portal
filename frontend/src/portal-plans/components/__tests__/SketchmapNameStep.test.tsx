import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SketchmapNameStep from '../SketchmapNameStep'

vi.mock('../../../components/shared/Button', () => ({
  default: ({ children, onClick, disabled }: any) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}))
vi.mock('../../../components/shared/Icon', () => ({ default: () => null }))

function setup(value: string) {
  const onChange = vi.fn()
  const onConfirm = vi.fn()
  const onBack = vi.fn()
  render(
    <SketchmapNameStep
      app="sketchmap"
      projectId="abc123"
      value={value}
      onChange={onChange}
      onConfirm={onConfirm}
      onBack={onBack}
    />
  )
  return { onChange, onConfirm, onBack }
}

describe('SketchmapNameStep', () => {
  it('tells the user what to do and that the URL was recognized', () => {
    setup('')
    expect(screen.getByText('Give this project a name')).toBeTruthy()
    expect(screen.getByText(/URL recognized:/)).toBeTruthy()
    expect(screen.getByText(/Choose the name that will appear in your plan/)).toBeTruthy()
  })

  it('disables Add until a name is typed', () => {
    setup('   ')
    expect((screen.getByText('Add') as HTMLButtonElement).disabled).toBe(true)
  })

  it('confirms with the button and with Enter, and goes back', () => {
    const { onConfirm, onBack } = setup('Floods')
    fireEvent.click(screen.getByText('Add'))
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    fireEvent.click(screen.getByText('Back'))
    expect(onConfirm).toHaveBeenCalledTimes(2)
    expect(onBack).toHaveBeenCalledTimes(1)
  })
})
