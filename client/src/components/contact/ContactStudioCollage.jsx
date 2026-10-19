// A small photo mosaic beside the contact details: four tiles of different
// shapes (one wide, one tall, two square-ish) so the column reads like a studio
// wall rather than a stack of identical cards.
//
// Every tile uses the banner artwork for now. When real studio photography is
// added, drop the files in and swap the `src` values — the tiles crop with
// object-cover, so any aspect ratio works.
const tiles = [
  {
    id: 'studio-wide',
    src: '/images/placeholder-banner.svg',
    className: 'col-span-2',
    position: '30% 42%',
  },
  {
    id: 'studio-tall',
    src: '/images/placeholder-banner.svg',
    className: 'row-span-2',
    position: '68% 30%',
  },
  {
    id: 'studio-detail',
    src: '/images/placeholder-banner.svg',
    className: '',
    position: '50% 65%',
  },
  {
    id: 'studio-fabric',
    src: '/images/placeholder-banner.svg',
    className: '',
    position: '22% 70%',
  },
];

export default function ContactStudioCollage({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={['grid h-[230px] grid-cols-3 grid-rows-2 gap-2.5 sm:gap-3', className]
        .filter(Boolean)
        .join(' ')}
    >
      {tiles.map((tile) => (
        <div
          key={tile.id}
          className={[
            'relative min-h-0 overflow-hidden rounded-2xl border border-border bg-peach/30',
            tile.className,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <img
            src={tile.src}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
            style={{ objectPosition: tile.position }}
          />
        </div>
      ))}
    </div>
  );
}
