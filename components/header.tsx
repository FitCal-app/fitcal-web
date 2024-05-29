'use client'; 

import Link from 'next/link'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

import { useTheme } from 'next-themes';

import logoLight from '../public/logo-light.svg';
import logoDark from '../public/logo-dark.svg'; 


export default function Header() {
  const { theme } = useTheme();
  
  return (
    <header className="py-4">
      <nav className="container flex items-center justify-between">
        <Link href="/">
          <Image
            src={theme === 'light' ? logoLight : logoDark}
            width={50}
            height={50}
            alt="Picture of the author"
          />
        </Link>
        
        <ul className='flex gap-10 text-sm font-medium'>
          <li>
            <Link href='/protected/home'>Persosnal Homepage</Link>
          </li>
          <li>
            <Link href='/protected/tdee-calculator'>TDEE Calculator</Link>
          </li>
        </ul>

        <div className='flex items-center justify-between gap-6'>
          <ThemeToggle />

          <SignedOut>
            <SignInButton mode='modal'>
              <Button size='sm'>Sign in</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </nav>
    </header>
  )
}
