"use client"

import React, { useEffect, useState } from 'react';

interface Needs {
  calories: number;
  carbohydrates: number;
  proteins: number;
  fats: number;
}

interface Meal {
  // Define the meal schema properties
  // Example:
  name: string;
  calories: number;
}

interface User {
  clerkUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
  gender: string;
  height: number;
  weight: number;
  needs: Needs;
  history: Meal[];
  personal_products: any[];
}

interface EditProfileProps {
  userId: string;
}

const EditProfile: React.FC<EditProfileProps> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:5173/api/users/clerk/${userId}`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data: User = await res.json();
        setUser(data);
        setLoading(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <h1>User Details</h1>
      <ul>
        <li><strong>Clerk User ID:</strong> {user.clerkUserId}</li>
        <li><strong>Email:</strong> {user.email}</li>
        <li><strong>First Name:</strong> {user.firstName}</li>
        <li><strong>Last Name:</strong> {user.lastName}</li>
        <li><strong>Image:</strong> <img src={user.image} alt={`${user.firstName} ${user.lastName}`} /></li>
        <li><strong>Gender:</strong> {user.gender}</li>
        <li><strong>Height:</strong> {user.height}</li>
        <li><strong>Weight:</strong> {user.weight}</li>
        <li><strong>Needs:</strong></li>
        <ul>
          <li><strong>Calories:</strong> {user.needs.calories}</li>
          <li><strong>Carbohydrates:</strong> {user.needs.carbohydrates}</li>
          <li><strong>Proteins:</strong> {user.needs.proteins}</li>
          <li><strong>Fats:</strong> {user.needs.fats}</li>
        </ul>
        <li><strong>History:</strong></li>
        <ul>
          {user.history.map((meal, index) => (
            <li key={index}>{JSON.stringify(meal)}</li>
          ))}
        </ul>
        <li><strong>Personal Products:</strong></li>
        <ul>
          {user.personal_products.map((product, index) => (
            <li key={index}>{JSON.stringify(product)}</li>
          ))}
        </ul>
      </ul>
    </div>
  );
};

export default EditProfile;