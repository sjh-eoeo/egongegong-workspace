'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@heroui/react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to projects page
    router.push('/projects');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Spinner size="lg" label="Loading..." />
    </div>
  );
}
