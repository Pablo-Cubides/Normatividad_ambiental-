/// <reference types="react" />
/// <reference types="react-dom" />

declare module '@/components/ui/button' {
  import * as React from 'react';
  export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: string;
    size?: string;
    asChild?: boolean;
  }
  export const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
}

declare module '@/components/ui/card' {
  import * as React from 'react';
  export const Card: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
  export const CardHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
  export const CardTitle: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLHeadingElement> & React.RefAttributes<HTMLParagraphElement>>;
  export const CardDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
  export const CardContent: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
  export const CardFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
}

declare module '@/components/ui/badge' {
  import * as React from 'react';
  export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: string;
  }
  export function Badge(props: BadgeProps): JSX.Element;
}

declare module '@/components/ui/input' {
  import * as React from 'react';
  export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
  export const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
}

declare module '@/components/LoadingSkeleton' {
  import * as React from 'react';
  interface LoadingSkeletonProps {
    type?: string;
    rows?: number;
  }
  interface TableSkeletonProps {
    rows?: number;
    columns?: number;
  }
  export const LoadingSkeleton: React.FC<LoadingSkeletonProps>;
  export const TableSkeleton: React.FC<TableSkeletonProps>;
}

declare module '@/lib/types' {
  export interface Country {
    code: string;
    name: string;
    flag: string;
  }
  
  export interface CountryStandards extends Record<string, unknown> {
    country: string;
    domain: string;
    sectors?: Record<string, unknown>;
    _sectors?: Record<string, unknown>;
    sources?: Array<{ name: string; url: string }>;
    records?: Array<Record<string, unknown>>;
    registros?: Array<Record<string, unknown>>;
  }
  
  export interface Dominio {
    id: string;
    label: string;
    icon: React.ReactNode;
  }
  
  export interface RegulatorySource {
    name: string;
    url: string;
    type?: string;
  }
}

declare module '@/lib/constants' {
  import * as React from 'react';
  import type { Dominio, RegulatorySource } from '@/lib/types';
  
  export const DOMINIOS: Dominio[];
  export const REGULATORY_SOURCES: Record<string, Record<string, RegulatorySource[]>>;
  export function getFlagEmoji(countryCode: string): string;
}
