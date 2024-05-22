import React from 'react';
import { auth, currentUser } from '@clerk/nextjs/server'

import UserMeals from '@/components/user-meals'

export default async function Page() {
  const { userId } = auth()
  const user = await currentUser()


  return (
    <section className='py-24'>
      <div className='container'>
        <h1 className='text-3xl font-bold'>Welcome {user?.firstName}</h1>

        <UserMeals  userId={userId as string} />
      </div>
    </section>
  )
}
