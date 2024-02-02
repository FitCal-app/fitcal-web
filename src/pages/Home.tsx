import { Button } from "@material-tailwind/react";

function Home() {
    return (
      <>
        <h1>Homepage</h1>
        <Button
            size="md"
        >
            <a href="/dashboard"><span>Go to Dashboard</span></a>
        </Button>
      </>
    )
  }
   
export default Home