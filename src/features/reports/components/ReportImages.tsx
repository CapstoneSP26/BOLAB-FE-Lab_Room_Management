import type { ReportImage } from "../type";

export default function ReportImages({ images }: { images: ReportImage[] }) {
  if (images.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-6 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        No images attached.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((img) => (
        <a
          key={img.Id}
          href={img.ImageLink}
          target="_blank"
          rel="noreferrer"
          className="group overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
          title="Open image"
        >
          <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-white/[0.04]">
            <img
              src={img.ImageLink}
              alt="report"
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
              loading="lazy"
            />
          </div>
          <div className="flex items-center justify-between px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="uppercase">{img.FileType}</span>
            <span>{Math.round(img.Size)} KB</span>
          </div>
        </a>
      ))}
    </div>
  );
}
