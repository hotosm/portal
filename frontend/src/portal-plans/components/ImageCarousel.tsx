import { useState } from 'react'

interface CarouselImage {
  id: string
  url: string
}

interface ImageCarouselProps {
  images: CarouselImage[]
  onRemove?: (id: string) => void
}

function ImageCarousel({ images, onRemove }: ImageCarouselProps) {
  const [index, setIndex] = useState(0)

  if (images.length === 0) return null

  const current = images[Math.min(index, images.length - 1)]

  function prev() {
    setIndex((i) => (i - 1 + images.length) % images.length)
  }

  function next() {
    setIndex((i) => (i + 1) % images.length)
  }

  return (
    <div className="flex flex-col gap-sm">
      <div className="relative w-full rounded-lg overflow-hidden bg-hot-gray-100" style={{ aspectRatio: '16/9' }}>
        <img
          src={current.url}
          alt={`Image ${index + 1} of ${images.length}`}
          className="w-full h-full object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm"
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm"
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}

        {onRemove && (
          <button
            type="button"
            onClick={() => {
              onRemove(current.id)
              setIndex((i) => Math.max(0, Math.min(i, images.length - 2)))
            }}
            className="absolute top-2 right-2 bg-black/50 hover:bg-hot-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs"
            aria-label="Remove image"
          >
            ✕
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-xs">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === index ? 'bg-hot-red-500' : 'bg-hot-gray-300 hover:bg-hot-gray-400'
              }`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageCarousel
