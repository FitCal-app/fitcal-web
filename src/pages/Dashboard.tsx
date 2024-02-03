import { useUser } from "@clerk/clerk-react";

import AddFood from "../components/AddFood";
import MealList from '../components/MealList';

const Dashboard = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  
  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return (
      <>
        <div>Hello {user.id}</div>

        <MealList clerkUserId={user.id} />

        <AddFood clerkUserId={user.id} />
      </>
    );
  }
     
  return <div>Not signed in</div>;
}

export default Dashboard;
