"use client"

import React, { useState } from 'react';

import { Button } from "@/components/ui/button"


interface FormProps {
  userId: string;
}

const FormComponent: React.FC<FormProps> = ({ userId }) => {
  const [formData, setFormData] = useState({
    // Define your form fields
    email: '',
    // Add more fields as needed
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    try {
      console.log( JSON.stringify(formData))
      const response = await fetch(`http://localhost:5173/api/users/clerk/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        // Handle success
        console.log('Data sent successfully');
      } else {
        // Handle non-success status codes
        console.error('Failed to send data. Status:', response.status);
        // Log response body if available
        const responseBody = await response.json();
        console.error('Response Body:', responseBody);
      }
    } catch (error) {
      // Handle network errors or other exceptions
      console.error('Error sending data:', error);
    }
  };
  

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" />
        {/* Add more form fields as needed */}
        <Button type="submit">Submit</Button>
      </form>
    </>
  );
};

export default FormComponent;
