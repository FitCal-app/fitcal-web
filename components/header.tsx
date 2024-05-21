import Link from 'next/link'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

import logo from '../public/logo.svg'

export default function Header() {
  return (
    <header className='py-4'>
      <nav className='container flex items-center justify-between'>
        <Link href='/'>
          <Image
            src={logo}
            width={50}
            height={50}
            alt="Picture of the author"
          />
        </Link>
        
        <ul className='flex gap-10 text-sm font-medium'>
          <li>
            <Link href='/protected/home'>Personal Homepage</Link>
          </li>
          <li>
            <Link href='/protected/client'>Protected (client)</Link>
          </li>
          <li>
            <Link href='/protected/tdee-calculator'>TDEE Calculator</Link>
          </li>
          <li>
            <Link href='/api/me'>Who am I?</Link>
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
