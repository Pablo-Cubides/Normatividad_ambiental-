import React from 'react';

// UI Component type declarations
declare module 'react' {
  interface ComponentProps {
    children?: React.ReactNode;
  }
}

// External library declarations
declare module 'next/link' {
  export interface LinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
  }
}
