import { SignInButton } from "@clerk/clerk-react"

function Home() {
    return (
      <>
        <SignInButton mode='modal' redirectUrl="/dashboard" />
      </>
    )
  }
   
export default Home