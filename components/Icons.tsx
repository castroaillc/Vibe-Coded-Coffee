type IconName = "cup" | "laptop" | "people" | "bulb" | "arrow" | "check";

const paths: Record<IconName, React.ReactNode> = {
  cup: (
    <>
      <path d="M5 11h12v4a6 6 0 0 1-6 6h0a6 6 0 0 1-6-6v-4Z" />
      <path d="M17 12.5h1.5a2.5 2.5 0 0 1 0 5H16.5" />
      <path d="M9 3.5c-.8 1 .8 2 0 3M12.5 3.5c-.8 1 .8 2 0 3" />
    </>
  ),
  laptop: (
    <>
      <rect x="5" y="5" width="14" height="10" rx="1.2" />
      <path d="M2.5 18.5h19" />
    </>
  ),
  people: (
    <>
      <circle cx="12" cy="8" r="3" />
      <path d="M6.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="5" cy="10" r="2" />
      <circle cx="19" cy="10" r="2" />
      <path d="M1.8 17.5A3.6 3.6 0 0 1 5 15M22.2 17.5A3.6 3.6 0 0 0 19 15" />
    </>
  ),
  bulb: (
    <>
      <path d="M8.5 14.5a6 6 0 1 1 7 0c-.6.5-1 1.1-1 1.9V17h-5v-.6c0-.8-.4-1.4-1-1.9Z" />
      <path d="M9.5 20h5" />
    </>
  ),
  arrow: <path d="M4 12h15M13 6l6 6-6 6" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
};

export function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
