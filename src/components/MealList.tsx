import { Card, CardBody, CardHeader } from '@material-tailwind/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

const MealList = ({ clerkUserId }) => {
  const [mealData, setMealData] = useState({});
  const [productData, setProductData] = useState<{ [barcode: string]: string }>({});

  const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];

  type Food = {
    _id: string;
    barcode: string;
    grams: number;
  };

  useEffect(() => {
    // Make a GET request to fetch meal data
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/meals/clerk/${clerkUserId}`);
        setMealData(response.data);
      } catch (error) {
        console.error('Error fetching meal data', error);
      }
    };

    const fetchProductData = async () => {
      const updatedProductData: { [barcode: string]: string } = {};
    
      const barcodeList = validMealTypes.flatMap((mealType) =>
        (mealData[mealType] as Food[] || []).map((food) => food.barcode)
      );
    
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    
      for (const barcode of barcodeList) {
        try {
          const response = await axios.get(`https://it.openfoodfacts.org/api/v0/product/${barcode}.json`);
          const productName = response.data.product?.product_name || 'Product not found';
          updatedProductData[barcode] = productName;
        } catch (error) {
          console.error(`Error fetching product data for barcode ${barcode}`, error);
          updatedProductData[barcode] = 'Error fetching product data';
        }
    
        // Introduce a delay between requests (adjust the delay as needed)
        await delay(100); // 100 milliseconds delay, adjust as needed
      }
    
      setProductData(updatedProductData);
    };
    

    fetchData();
    fetchProductData();
  }, [clerkUserId]);

  const renderMealTypes = () => {
    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
  
    type Food = {
        _id: string;
        barcode: string;
        grams: number;
    };

    return validMealTypes.map((mealType) => {
      const foods = mealData[mealType] as Food[]; 
  
      return (
        <Card key={mealType}>
          <CardHeader contentPosition="none">
            <div className="bg-gray-200 p-2 text-lg font-semibold">{mealType.charAt(0).toUpperCase() + mealType.slice(1)}:</div>
          </CardHeader>
          <CardBody>
            {foods && Array.isArray(foods) && foods.length > 0 ? (
              foods.map((food) => (
                <div key={food._id} className="border p-2 flex justify-between items-center">
                  <div>{productData[food.barcode]} ({food.barcode})</div>
                  <div>{food.grams}g</div>
                </div>
              ))
            ) : (
              <div className="border p-2 text-center">
                No food logged for this meal
              </div>
            )}
          </CardBody>
        </Card>
      );
    });
  };
  
  return (
    <div className="mx-auto w-2/3 mt-8 space-y-4">
        {renderMealTypes()}
    </div>
  );
};

export default MealList;
