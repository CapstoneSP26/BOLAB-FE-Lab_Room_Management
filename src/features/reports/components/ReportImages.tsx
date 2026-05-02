import { addCacheBuster } from "../../../utils/imageCache";
import type { ReportImage } from "../types/report.type";

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
      {images.map((img, index) => {
        const isString = typeof img === "string";
        const imageLink = isString 
          ? img 
          : img.ImageLink || (img as any).imageLink || (img as any).url || (img as any).ImageURL;
          
        const fileType = isString ? "IMAGE" : img.FileType || (img as any).fileType || "IMAGE";
        const fileSize = isString ? 0 : img.Size || (img as any).size || 0;
        const id = isString ? `img-${index}` : img.Id || (img as any).id || `img-${index}`;

        return (
          <a
            key={id}
            href={addCacheBuster(imageLink)}
            target="_blank"
            rel="noreferrer"
            className="group overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
            title="Open image"
          >
            <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-white/[0.04]">
              <img
                src={addCacheBuster(imageLink)}
                alt="report"
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </div>
            <div className="flex items-center justify-between px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="uppercase">{fileType}</span>
              <span>{Math.round(fileSize)} KB</span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
