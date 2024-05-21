import { auth } from '@clerk/nextjs/server'

import EditProfile from '@/components/edit-profile'


export default async function Page() {
  const { userId } = auth()

  return (
    <section className='py-24'>
      <div className='container'>
        <EditProfile  userId={userId as string} />
      </div>
    </section>
  )
}
