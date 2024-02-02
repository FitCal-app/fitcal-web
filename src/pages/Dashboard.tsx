import { useUser } from "@clerk/clerk-react";
import { useEffect } from 'react';

import AddFood from "../components/AddFood";
import MealList from '../components/MealList';
import NavBar from '../components/Navbar';

const Dashboard = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  
  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return (
      <>
        <NavBar />
        <div>Hello {user.id}</div>

        <MealList clerkUserId={user.id} />

        <AddFood clerkUserId={user.id} />
      </>
    );
  }
     
  return <div>Not signed in</div>;
}

export default Dashboard;
