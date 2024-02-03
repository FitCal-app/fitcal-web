import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import NavBar from './components/Navbar';
import Dashboard from "./pages/Dashboard.jsx";
import Home from "./pages/Home.jsx";


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route index element={<Home />} />
      <Route path="/dashboard" element={<>
        <SignedIn>
          <Dashboard />
        </SignedIn>

        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </>} />
    </>
  )
);

function App() {
  return (
    <>
      <NavBar />
      <RouterProvider router={router} />
    </>
  )
}
 
export default App