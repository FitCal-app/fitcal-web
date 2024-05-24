"use client"

import React, { useState, useEffect } from 'react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from '@radix-ui/react-dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check } from "lucide-react";
import { AlertCircle } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"  


const apiKey = process.env.NEXT_PUBLIC_API_URL;

interface FormProps {
    userId: string;
}

interface NeedsData {
    calories: number;
    carbohydrates: number;
    proteins: number;
    fats: number;
}  

const TdeeCalculator: React.FC<FormProps> = ({ userId }) => {
    const [formData, setFormData] = useState({
        weight: '',
        height: '',
        age: '',
        gender: 'male',
        activityLevel: '1.2'
    });
    const [needs, setNeeds] = useState<NeedsData | null>(null);
    const [calories, setCalories] = useState<number | null>(null);
    const [macros, setMacros] = useState<{ carbs: number, protein: number, fat: number } | null>(null);
    const [isDataSent, setIsDataSent] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    useEffect(() => {
        if (errorMessage || isDataSent) {
            const timer = setTimeout(() => {
                setErrorMessage('');
                setIsDataSent(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [errorMessage, isDataSent]);

    // Fetch user needs on component mount
    useEffect(() => {
        const fetchUserNeeds = async () => {
            try {
                const response = await fetch(`${apiKey}/api/users/clerk/${userId}`);
                if (response.ok) {
                    const userData = await response.json();
                    if (userData.needs) {
                        setNeeds(userData.needs);
                    }
                } else {
                    console.error('Failed to fetch user data. Status:', response.status);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserNeeds();
    }, [userId]);

    useEffect(() => {
        const { weight, height, age, gender, activityLevel } = formData;
        if (weight && height && age) { // Cleaner condition check
          const w = parseFloat(weight), h = parseFloat(height), a = parseFloat(age), al = parseFloat(activityLevel);
          const bmr = gender === 'male' ? 88.362 + 13.397 * w + 4.799 * h - 5.677 * a : 447.593 + 9.247 * w + 3.098 * h - 4.330 * a;
          const tdee = bmr * al;
    
          setCalories(Math.round(tdee));
          setMacros({
            carbs: Math.round((tdee * 0.45) / 4),
            protein: Math.round((tdee * 0.3) / 4),
            fat: Math.round((tdee * 0.25) / 9),
          });
        } else { // Reset results if form is incomplete
          setCalories(null);
          setMacros(null); 
        }
      }, [formData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleSelectChange = (value: string) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            activityLevel: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const needsData = {
            calories: calories,
            carbohydrates: macros?.carbs,
            proteins: macros?.protein,
            fats: macros?.fat,
        };

        try {
            const response = await fetch(`${apiKey}/api/users/clerk/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ needs: needsData }),
            });

            if (response.ok) {
                console.log('Data sent successfully');
                setIsDataSent(true);
                setErrorMessage('');
                setIsDialogOpen(false);  // Close the dialog on successful submission

                // Fetch user data after updating needs
                const userResponse = await fetch(`${apiKey}/api/users/clerk/${userId}`);
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setNeeds(userData.needs);
                } else {
                    console.error('Failed to fetch user data. Status:', userResponse.status);
                }

                // Reset form data
                setFormData({
                    weight: '',
                    height: '',
                    age: '',
                    gender: 'male',
                    activityLevel: '1.2'
                });

                // Reset calories and macros
                setCalories(null);
                setMacros(null);

            } else {
                const responseBody = await response.json();
                setErrorMessage('Failed to send data. Status: ' + response.status + '. Response Body: ' + JSON.stringify(responseBody));
            }
        } catch (error) {
            setErrorMessage('Error sending data: ' + error);
        }
    };

    const isFormFilled = Object.values(formData).every(value => value !== '');

    return (
        <>
            {errorMessage && 
                <Alert variant="destructive" className='mb-3'>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            }
            {isDataSent && 
                <Alert className='mb-3'>
                    <Check className="h-4 w-4" />
                    <AlertTitle className='text-green-500'>Data sent successfully!</AlertTitle>
                </Alert>
            }
            
            <div className='grid grid-cols-2 grid-rows-1 gap-5'>
                <div className="col-span-1">
                    {needs ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Current Needs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div>
                                    <div>
                                        <strong>Calories:</strong> {needs.calories} kcal
                                    </div>
                                    <div>
                                        <strong>Carbohydrates:</strong> {needs.carbohydrates} g
                                    </div>
                                    <div>
                                        <strong>Protein:</strong> {needs.proteins} g
                                    </div>
                                    <div>
                                        <strong>Fat:</strong> {needs.fats} g
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>No previous needs found</CardTitle>
                                <CardDescription>Please calculate your first TDEE</CardDescription>
                            </CardHeader>
                        </Card>
                    )}
                </div>

                <div className="col-start-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>TDEE Calculator</CardTitle>
                            <CardDescription>Calculate your TDEE</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); handleSubmit(e); }}>
                                <div className="grid grid-cols-1 xl:grid-cols-1 gap-4">
                                    <div className="w-full">
                                        <Label>Weight (kg)</Label>
                                        <Input type="number" name="weight" value={formData.weight} onChange={handleInputChange} placeholder="Weight" required />
                                    </div>

                                    <div className="w-full">
                                        <Label>Height (cm)</Label>
                                        <Input type="number" name="height" value={formData.height} onChange={handleInputChange} placeholder="Height" required />
                                    </div>

                                    <div className="w-full">
                                        <Label>Age</Label>
                                        <Input type="number" name="age" value={formData.age} onChange={handleInputChange} placeholder="Age" required />
                                    </div>

                                    <div className="w-full">
                                        <Label>Gender</Label>
                                        <Select name="gender" value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Male</SelectItem>
                                                <SelectItem value="female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="w-full">
                                        <Label>Activity Level</Label>
                                        <Select name="activityLevel" value={formData.activityLevel} onValueChange={handleSelectChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select activity level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1.2">Sedentary</SelectItem>
                                                <SelectItem value="1.375">Lightly active</SelectItem>
                                                <SelectItem value="1.55">Moderately active</SelectItem>
                                                <SelectItem value="1.725">Very active</SelectItem>
                                                <SelectItem value="1.9">Super active</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="w-full mt-3">
                                        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                            <AlertDialogTrigger asChild>
                                                <Button className='w-full' disabled={!isFormFilled}>Check preview</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Data Preview</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        <div>
                                                            <div>
                                                                <strong>Calories:</strong> {calories} kcal
                                                            </div>
                                                            <div>
                                                                <strong>Carbohydrates:</strong> {macros?.carbs} g
                                                            </div>
                                                            <div>
                                                                <strong>Protein:</strong> {macros?.protein} g
                                                            </div>
                                                            <div>
                                                                <strong>Fat:</strong> {macros?.fat} g
                                                            </div>
                                                        </div>
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <Button onClick={handleSubmit}>Save to Profile</Button>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};
  
export default TdeeCalculator;