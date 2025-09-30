declare module 'next/link';
declare module 'lucide-react';
declare module '@/components/*';
declare module '@/lib/*';
declare module '*.css';

// Allow any JSX intrinsic elements to avoid many implicit 'any' JSX errors
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};
