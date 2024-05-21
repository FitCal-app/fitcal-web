"use client"

import React, { useState, useEffect } from 'react';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from '@radix-ui/react-dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Check } from "lucide-react"
import { AlertCircle } from "lucide-react"


const apiKey = process.env.NEXT_PUBLIC_API_URL;

interface FormProps {
  userId: string;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  weight: number;
  height: number;
}

const FormComponent: React.FC<FormProps> = ({ userId }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    weight: '',
    height: '',
  });
  const [isDataSent, setIsDataSent] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (errorMessage || isDataSent) {
      const timer = setTimeout(() => {
        setErrorMessage('');
        setIsDataSent(false);
      }, 3000); // Adjust the duration as needed (5000 milliseconds = 5 seconds)

      return () => clearTimeout(timer);
    }
  }, [errorMessage, isDataSent]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiKey}/api/users/clerk/${userId}`);
        if (response.ok) {
          const userData = await response.json();
          setUserData(userData);
        } else {
          console.error('Failed to fetch user data. Status:', response.status);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData();
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const filteredFormData = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value.trim() !== '')
    );

    try {
      const response = await fetch(`${apiKey}/api/users/clerk/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filteredFormData),
      });

      if (response.ok) {
        console.log('Data sent successfully');
        setIsDataSent(true);
        setErrorMessage('');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          weight: '',
          height: '',
        });
        setUserData((prevUserData) => {
          if (!prevUserData) return prevUserData;
          return {
            ...prevUserData,
            ...filteredFormData,
          };
        });
      } else {
        const responseBody = await response.json();
        setErrorMessage('Failed to send data. Status: ' + response.status + '. Response Body: ' + JSON.stringify(responseBody));
      }
    } catch (error) {
      setErrorMessage('Error sending data: ' + error);
    }
  };

  return (
    <>
      {errorMessage && 
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>
      }
      {isDataSent && 
        <Alert>
          <Check className="h-4 w-4" />
          <AlertTitle>Data sent successfully!</AlertTitle>
        </Alert>
      }
      <h1 className='text-3xl font-bold'>Personal Data</h1>
      <form onSubmit={handleSubmit}>
        <Label>Firstname</Label>
        <Input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder={userData?.firstName || "Firstname"} />

        <Label>Lastname</Label>
        <Input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder={userData?.lastName || "Lastname"} />

        <Label>Email</Label>
        <Input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder={userData?.email || "Email"} />

        <Button type="submit">Submit</Button>
      </form>

      <h1 className='text-3xl font-bold'>My Stats</h1>
      <form onSubmit={handleSubmit}>
        <Label>Weight</Label>
        <Input type="number" name="weight" value={formData.weight} onChange={handleInputChange} placeholder={userData?.weight.toString() + " kg" || "Weight"} />

        <Label>Height</Label>
        <Input type="number" name="height" value={formData.height} onChange={handleInputChange} placeholder={userData?.height.toString() + " cm" || "Height"} />

        <Button type="submit">Submit</Button>
      </form>
    </>
  );
};

export default FormComponent;
