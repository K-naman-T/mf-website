type DecorativeAssetProps = {
  className?: string;
  title?: string;
};

const pad = (value: number) => String(value).padStart(2, "0");

export const OFY_PLATES = Array.from({ length: 22 }, (_, index) => index + 1);
export const OFY_ICONS = Array.from({ length: 40 }, (_, index) => index + 1);

export function getOfyPlateSrc(id: number) {
  const value = pad(id);
  return `/assets/ofy-kit/plates/${value}_plates_${value}.svg`;
}

export function getOfyIconSrc(id: number) {
  const value = pad(id);
  return `/assets/ofy-kit/icons/${value}_icons_${value}.svg`;
}

function DecorativeImage({ src, className, title }: DecorativeAssetProps & { src: string }) {
  return (
    <img
      className={className}
      src={src}
      alt={title ?? ""}
      aria-hidden={title ? undefined : true}
      loading="lazy"
      decoding="async"
    />
  );
}

export function OfyPlate({ id, className, title }: DecorativeAssetProps & { id: number }) {
  return <DecorativeImage src={getOfyPlateSrc(id)} className={className} title={title} />;
}

export function OfyIcon({ id, className, title }: DecorativeAssetProps & { id: number }) {
  return <DecorativeImage src={getOfyIconSrc(id)} className={className} title={title} />;
}
