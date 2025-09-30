import React from 'react';

type DivProps = React.HTMLAttributes<HTMLDivElement> & { className?: string };

export const Card: React.FC<React.PropsWithChildren<DivProps>> = ({ children, ...rest }) => (
	<div {...rest}>{children}</div>
);

export const CardHeader: React.FC<React.PropsWithChildren<DivProps>> = ({ children, ...rest }) => (
	<div {...rest}>{children}</div>
);

export const CardContent: React.FC<React.PropsWithChildren<DivProps>> = ({ children, ...rest }) => (
	<div {...rest}>{children}</div>
);

export const CardTitle: React.FC<React.PropsWithChildren<DivProps>> = ({ children, ...rest }) => (
	<div {...rest}>{children}</div>
);

export const CardDescription: React.FC<React.PropsWithChildren<DivProps>> = ({ children, ...rest }) => (
	<div {...rest}>{children}</div>
);

export default Card;
