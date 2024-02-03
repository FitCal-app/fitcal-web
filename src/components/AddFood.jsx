// FoodFormPage.js
import axios from 'axios';
import { useState } from 'react';

const AddFood = ({ clerkUserId }) => {
  const [mealType, setMealType] = useState('');
  const [barcode, setBarcode] = useState('');
  const [grams, setGrams] = useState('');

  const handleAddFood = () => {
    const apiUrl = `http://localhost:3001/api/meals/clerk/${clerkUserId}/foods`;

    const requestBody = {
      mealType: mealType,
      food: {
        grams: parseInt(grams),
        barcode: barcode,
      },
    };

    axios.post(apiUrl, requestBody)
      .then(response => {
        console.log('Food added successfully', response.data);
        // Optionally, you can redirect or perform other actions after a successful API call
      })
      .catch(error => {
        console.error('Error adding food', error);
      });
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-3xl font-semibold mb-4">Add Food</h1>
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">Meal Type</label>
          <select
            className="mt-1 p-2 w-full border rounded-md"
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
          >
            <option value="">Select Meal Type</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snacks">Snacks</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">Barcode</label>
          <textarea
            className="mt-1 p-2 w-full border rounded-md"
            rows="1"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">Grams</label>
          <textarea
            className="mt-1 p-2 w-full border rounded-md"
            rows="1"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
          />
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={handleAddFood}
        >
          Add Food
        </button>
      </div>
    </div>
  );
}

export default AddFood;
