import { currentUser } from '@clerk/nextjs/server'
import { auth } from '@clerk/nextjs/server'

import EditProfile from '@/components/edit-profile'


import { z } from "zod"


export default async function Page() {
  const { userId } = auth()

  return (
    <section className='py-24'>
      <div className='container'>
        <h1 className='text-3xl font-bold'>Edit Profile</h1>
        <EditProfile  userId={userId as string} />
      </div>
    </section>
  )
}
