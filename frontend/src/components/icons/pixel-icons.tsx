import type { SVGProps } from "react";

const sharedProps: SVGProps<SVGSVGElement> = {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "currentColor",
  xmlns: "http://www.w3.org/2000/svg",
  shapeRendering: "crispEdges",
};

export const HomeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <path d="M12 3L4 9V21H9V14H15V21H20V9L12 3Z" />
  </svg>
);

export const NftIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <path d="M4 3H20V5H4V3Z" />
    <path d="M4 7H20V9H4V7Z" />
    <path d="M4 11H20V19H4V11ZM6 13V17H18V13H6Z" />
  </svg>
);

export const MintIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <path d="M11 5H13V11H19V13H13V19H11V13H5V11H11V5Z" />
  </svg>
);

export const LeaderboardIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <path d="M5 3H19V7H5V3Z" />
    <path d="M7 9H17V12H7V9Z" />
    <path d="M9 14H15V17H9V14Z" />
    <path d="M11 19H13V22H11V19Z" />
    <path d="M4 11H7V22H4V11Z" />
    <path d="M17 11H20V22H17V11Z" />
  </svg>
);

export const SettingsIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...sharedProps} {...props}>
    <path d="M9 3H15V5H9V3Z" />
    <path d="M19 9H21V15H19V9Z" />
    <path d="M9 19H15V21H9V19Z" />
    <path d="M3 9H5V15H3V9Z" />
    <path d="M15.5 5.5L17.5 7.5L16.085 8.915L14.085 6.915L15.5 5.5Z" />
    <path d="M6.5 15.5L8.5 17.5L7.085 18.915L5.085 16.915L6.5 15.5Z" />
    <path d="M17.5 16.5L15.5 18.5L14.085 17.085L16.085 15.085L17.5 16.5Z" />
    <path d="M8.5 6.5L6.5 8.5L5.085 7.085L7.085 5.085L8.5 6.5Z" />
  </svg>
);
