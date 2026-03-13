import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

export type DropdownMenuItem = {
  label: string;
  to?: string; // nếu có -> render Link
  onClick?: () => void; // optional callback
};

type DropdownMenuProps = {
  menuItems?: DropdownMenuItem[];
  icon?: React.ReactNode;
  buttonClassName?: string;
  menuClassName?: string;
  itemClassName?: string;
  renderMenu?: (close: () => void) => React.ReactNode;
};

const DEFAULT_BUTTON = "text-gray-500 dark:text-gray-400";
const DEFAULT_MENU =
  "absolute right-0 z-40 w-40 p-2 space-y-1 bg-white border border-gray-200 top-full rounded-2xl shadow-lg dark:border-gray-800 dark:bg-gray-900";
const DEFAULT_ITEM =
  "flex w-full px-3 py-2 font-medium text-left text-gray-500 rounded-lg text-theme-xs hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300";

export default function DropdownMenu({
  menuItems = [],
  icon,
  buttonClassName = DEFAULT_BUTTON,
  menuClassName = DEFAULT_MENU,
  itemClassName = DEFAULT_ITEM,
  renderMenu,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const close = () => setOpen(false);
  const toggle = () => setOpen((v) => !v);

  // click outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (e.target instanceof Node && !root.contains(e.target)) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // ESC to close (bonus UX)
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const defaultIcon = useMemo(
    () => (
      <svg
        className="fill-current"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.99902 10.245C6.96552 10.245 7.74902 11.0285 7.74902 11.995V12.005C7.74902 12.9715 6.96552 13.755 5.99902 13.755C5.03253 13.755 4.24902 12.9715 4.24902 12.005V11.995C4.24902 11.0285 5.03253 10.245 5.99902 10.245ZM17.999 10.245C18.9655 10.245 19.749 11.0285 19.749 11.995V12.005C19.749 12.9715 18.9655 13.755 17.999 13.755C17.0325 13.755 16.249 12.9715 16.249 12.005V11.995C16.249 11.0285 17.0325 10.245 17.999 10.245ZM13.749 11.995C13.749 11.0285 12.9655 10.245 11.999 10.245C11.0325 10.245 10.249 11.0285 10.249 11.995V12.005C10.249 12.9715 11.0325 13.755 11.999 13.755C12.9655 13.755 13.749 12.9715 13.749 12.005V11.995Z"
          fill="currentColor"
        />
      </svg>
    ),
    [],
  );

  const handleItemClick = (cb?: () => void) => {
    if (typeof cb === "function") cb();
    close();
  };

  return (
    <div className="relative" ref={rootRef}>
      {/* Trigger */}
      <button type="button" onClick={toggle} className={buttonClassName}>
        {icon ?? defaultIcon}
      </button>

      {/* Menu */}
      {open && (
        <div className={menuClassName} role="menu">
          {renderMenu ? (
            renderMenu(close)
          ) : (
            <>
              {menuItems.map((item, index) => {
                if (item.to) {
                  return (
                    <Link
                      key={`router-${index}`}
                      to={item.to}
                      className={itemClassName}
                      onClick={() => handleItemClick(item.onClick)}
                    >
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <button
                    key={`button-${index}`}
                    type="button"
                    className={itemClassName}
                    onClick={() => handleItemClick(item.onClick)}
                  >
                    {item.label}
                  </button>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
