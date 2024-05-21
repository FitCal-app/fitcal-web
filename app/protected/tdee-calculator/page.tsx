import { auth } from '@clerk/nextjs/server'

import TdeeCalculator from '@/components/tdee-calculator'


export default async function Page() {
  const { userId } = auth()

  return (
    <section className='py-24'>
      <div className='container'>
        <TdeeCalculator  userId={userId as string} />
      </div>
    </section>
  )
}