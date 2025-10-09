
import * as React from 'react';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-700 ${className}`}
      {...props}
    />
  );
}

export default Skeleton;
