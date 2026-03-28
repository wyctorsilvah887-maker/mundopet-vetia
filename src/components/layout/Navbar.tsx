import Link from 'next/link';
import { PawPrint } from 'lucide-react';

export function Navbar() {
  return (
    <header className="border-b bg-card/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-2 rounded-xl text-primary-foreground group-hover:scale-110 transition-transform">
            <PawPrint className="w-6 h-6" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight text-primary">AnalisaPet AI</span>
        </Link>
      </div>
    </header>
  );
}
