'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useTheme } from 'next-themes';
import { Calendar as CalendarIcon, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";


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
  
interface FoodItem {
    grams: number;
    barcode: string;
    productName?: string;
    image?: string;
    calories?: number;
    carbohydrates?: number;
    proteins?: number;
    fats?: number;
}
  
  interface MealsData {
    [mealType: string]: FoodItem[];
}

const mealTypesToDisplay = ["breakfast", "snacks", "lunch", "dinner"];

const UserMeals: React.FC<FormProps> = ({ userId }) => {
    const { theme } = useTheme();

    const [date, setDate] = useState<Date | undefined>(new Date()); // Initialize with today's date
    const [meals, setMeals] = useState<MealsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [foodSpecsDialogsOpen, setFoodSpecsDialogsOpen] = useState<{ [key: string]: boolean }>({});
    const [mealType, setMealType] = useState("breakfast");
    const [grams, setGrams] = useState("");
    const [barcode, setBarcode] = useState("");
    const { toast } = useToast();


    const [totalNutrients, setTotalNutrients] = useState({
        calories: 0,
        carbs: 0,
        protein: 0,
        fat: 0,
    });

    const [totalTargetNutrients, setTotalTargetNutrients] = useState<NeedsData | null>(null);


     const fetchMeals = useCallback(async () => {
        if (date) {
          setLoading(true);
          setError(null);
          try {
            const formattedDate = format(date, "yyyy-MM-dd");
            const response = await fetch(`${apiKey}/api/meals/clerk/${userId}/date/${formattedDate}`);
  
            if (response.ok) {
              const data = await response.json();
              setMeals(data);
            } else if (response.status === 500) {
                const errorData = await response.json();
                if (errorData.error.includes("No meals found for the date")) {
                    // Create empty meal structure for the date if none exists
                    setMeals({
                        createdAt: formattedDate,
                        breakfast: [],
                        lunch: [],
                        dinner: [],
                        snacks: []
                    } as any); // Add 'as any' to bypass type checking
                } else {
                    throw new Error(errorData.error || 'Failed to fetch meals');
                }
            } else {
              throw new Error('Failed to fetch meals');
            }
          } catch (error) { 
            if (error instanceof Error) {
                console.error(error);
                toast({
                    title: "Failed to fetch meals:",
                    description: error.message,
                    variant: "destructive",
                });
            } else {
                console.error('An unexpected error occurred');
                toast({
                    title: "Failed to fetch meals:",
                    description: 'An unexpected error occurred',
                    variant: "destructive",
                });
            }
          } finally {
            setLoading(false);
          }
        }
    }, [date, userId]); // Dependencies for useCallback

    const calculateTotals = async () => { 
        if (!meals) return;
  
        let totalCalories = 0;
        let totalCarbs = 0;
        let totalProtein = 0;
        let totalFat = 0;
  
        for (const mealType of mealTypesToDisplay) {
            if (meals[mealType as keyof MealsData] && meals[mealType as keyof MealsData].length > 0) {
              for (const food of meals[mealType as keyof MealsData]) {
                try {
                    const response = await fetch(
                    `https://world.openfoodfacts.org/api/v0/product/${food.barcode}.json`
                    );
                    const data = await response.json();
    
                    if (data.status === 1 && data.product?.nutriments) {
                    const nutriments = data.product.nutriments;
                    const servingSize = food.grams / 100;
    
                    totalCalories += Math.round(
                        ((nutriments.energy_value * 0.239) * servingSize)
                    );
                    totalCarbs += Math.round(
                        (nutriments.carbohydrates || 0) * servingSize
                    );
                    totalProtein += Math.round(
                        (nutriments.proteins || 0) * servingSize
                    );
                    totalFat += Math.round((nutriments.fat || 0) * servingSize);

                    food.productName = data.product.product_name ?? ''; 
                    food.image = data.product.image_url ?? '';
                    food.calories = (nutriments.energy_value ?? 0) * 0.239;
                    food.carbohydrates = nutriments.carbohydrates ?? 0;
                    food.proteins = nutriments.proteins ?? 0;
                    food.fats = nutriments.fat ?? 0;
                }
              } catch (error) {
                console.error(
                  `Error fetching nutrition data for ${food.barcode}:`,
                  error
                );
              }
            }
          }
        }
  
        setTotalNutrients({
          calories: totalCalories,
          carbs: totalCarbs,
          protein: totalProtein,
          fat: totalFat,
        });
    };

    useEffect(() => {
        fetchMeals(); 
    }, [fetchMeals]); // Add fetchMeals as a dependency

    useEffect(() => {
        calculateTotals();
    }, [meals]);

    useEffect(() => {
        const fetchUserNeeds = async () => {
            try {
                const response = await fetch(`${apiKey}/api/users/clerk/${userId}`);
                if (response.ok) {
                    const userData = await response.json();
                    if (userData.needs) {
                        setTotalTargetNutrients(userData.needs);
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

   
    const handleSubmit = async () => {
        if (date) {
            const formattedDate = format(date, "yyyy-MM-dd");

            try {
                const response = await fetch(
                    `${apiKey}/api/meals/clerk/${userId}/foods/date/${formattedDate}`,
                        {
                            method: "POST",
                            headers: {
                            "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                            mealType,
                            food: { grams: parseInt(grams, 10), barcode },
                            }),
                        }
                );

                if (response.ok) {
                    // Update meals state IMMEDIATELY
                    setMeals((prevMeals) => {
                        if (!prevMeals) return null; // Add this check
                        const newMeals = { ...prevMeals };
                        if (prevMeals[mealType as keyof MealsData]) { // Check if the meal type exists before adding
                          newMeals[mealType as keyof MealsData] = [...prevMeals[mealType as keyof MealsData], { grams: parseInt(grams, 10), barcode }];
                        } else {
                          newMeals[mealType as keyof MealsData] = [{ grams: parseInt(grams, 10), barcode }];
                        }
                        return newMeals;
                      });

                    fetchMeals();
                    toast({ title: "Food added successfully!" });
                    calculateTotals(); // Recalculate totals
                } else {
                    throw new Error("Failed to add food item.");
                }
            } catch (error) {
                if (error instanceof Error) {
                    console.error(error);
                    toast({
                        title: "Error adding food item:",
                        description: error.message,
                        variant: "destructive",
                    });
                } else {
                    console.error('An unexpected error occurred');
                    toast({
                        title: "Error adding food item:",
                        description: 'An unexpected error occurred',
                        variant: "destructive",
                    });
                }
            } finally {
                setIsDialogOpen(false);
                setGrams(''); // Clear the grams input after submitting
                setBarcode(''); // Clear the barcode input after submitting
            }
        }
    };  
    
    const handleDeleteFoodItem = async (mealId: string, foodIndex: string, mealType: string) => {
        if (!date || !meals) return;

        const formattedDate = format(date, "yyyy-MM-dd");

        try {
            const endpoint = formattedDate
                ? `${apiKey}/api/meals/clerk/${userId}/foods/date/${formattedDate}/${mealId}/${mealType}/${foodIndex}`
                : `${apiKey}/api/meals/clerk/${userId}/foods/${mealId}/${mealType}/${foodIndex}`;
      
            console.log("Delete Endpoint:", endpoint); // Log the endpoint for debugging
        
            const response = await fetch(endpoint, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });
    
          if (response.ok) {
            fetchMeals(); // Refresh meals after deleting the item
            toast({ title: "Food deleted successfully!" });
          } else {
            const errorData = await response.json();
            console.error("Error response:", errorData); // Log the error data from the API
      
            // Customize error messages based on backend responses
            if (errorData.error.includes("No meal found for the date")) {
              throw new Error("No meal found for the selected date.");
            } else if (errorData.error.includes("No food item found at index")) {
              throw new Error("Food item not found in the meal.");
            } else {
              throw new Error(errorData.error || "Failed to delete food item.");
            }
          }
        } catch (error) {
            if (error instanceof Error) {
                console.error(error);
                toast({
                    title: "Error deleting food item:",
                    description: error.message,
                    variant: "destructive",
                });
            } else {
                console.error('An unexpected error occurred');
                toast({
                    title: "Error deleting food item:",
                    description: 'An unexpected error occurred',
                    variant: "destructive",
                });
            }
        }
    };
    

    const isFormFilled = mealType !== '' && grams !== '' && barcode !== '';

    const getErrorMessage = (error: unknown): string => {
        if (error instanceof Error) {
            return error.message;
        }
        return 'An unexpected error occurred';
    };


    return (
        <>
            <div className="container mx-auto mt-8">
                {totalTargetNutrients ? (
                    <Card className="mb-4 shadow-md rounded-lg overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-4">
                            <CardTitle className="text-lg font-bold">Total Nutrition</CardTitle>
                        </CardHeader>
                
                        <CardContent className="grid grid-cols-2 gap-4 mt-2">
                        {[
                            { name: "Calories", value: totalNutrients.calories, target: totalTargetNutrients?.calories, unit: "kcal" },
                            { name: "Carbs", value: totalNutrients.carbs, target: totalTargetNutrients?.carbohydrates, unit: "g" },
                            { name: "Protein", value: totalNutrients.protein, target: totalTargetNutrients?.proteins, unit: "g" },
                            { name: "Fat", value: totalNutrients.fat, target: totalTargetNutrients?.fats, unit: "g" },
                        ].map(({ name, value, target, unit }) => (
                            <div key={name}>
                                <p className="text-lg font-semibold">{name}</p>
                                <Progress
                                    value={(value / target) * 100}
                                    className={cn(
                                        value > target ? "bg-red-500 dark:bg-red-500" : "bg-white dark:bg-gray-700",
                                        `[&>*]:bg-${theme === "light" ? "gray7500" : ""}`
                                    )}
                                />
                                <p className="text-sm text-muted-foreground mt-2">{value} / {target} {unit}</p>
                            </div>
                        ))}
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="mb-4 shadow-md rounded-lg overflow-hidden">
                        <CardHeader>
                            <CardTitle>No previous needs found</CardTitle>
                            <CardDescription>Please calculate your first <a href='/protected/tdee-calculator' className="font-medium text-blue-600 underline dark:text-blue-500 hover:no-underline">TDEE</a> to see your daily progress</CardDescription>
                        </CardHeader>
                    </Card>
                )}

                <div className="flex justify-between items-center mb-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-[280px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(selectedDate: Date | undefined) => {
                                if (selectedDate) {
                                  setDate(selectedDate);
                                }
                              }}
                            initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button>Add Food</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Add Food to Meal</AlertDialogTitle>
                                <div className="space-y-4 mt-4">
                                    <div className="space-y-4 mt-4">
                                    <div>
                                        <Label htmlFor="mealType">Meal Type</Label>
                                        <Select
                                            value={mealType}
                                            onValueChange={setMealType}
                                        >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a meal type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mealTypesToDisplay.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </SelectItem>
                                            ))}
                                        </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="grams">Grams</Label>
                                        <Input 
                                        id="grams" 
                                        type="number" 
                                        value={grams} 
                                        onChange={(e) => setGrams(e.target.value)} 
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="barcode">Barcode</Label>
                                        <Input 
                                        id="barcode" 
                                        value={barcode} 
                                        onChange={(e) => setBarcode(e.target.value)} 
                                        />
                                    </div>
                                    </div>
                                </div>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleSubmit} disabled={!isFormFilled}>
                                    Add Item
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                {loading ? (
                    <p>Loading meals...</p>
                ) : error ? (
                    <p className="text-destructive">Error: {getErrorMessage(error)}</p>
                ) : meals ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {mealTypesToDisplay.map((mealType) => (
                                <Card
                                    key={mealType}
                                    className={`shadow-md rounded-lg overflow-hidden`}
                                >
                                    <CardHeader className="bg-primary text-primary-foreground p-4">
                                        <CardTitle className="text-lg font-bold">
                                            {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                                        </CardTitle>
                                    </CardHeader>

                                    <Table className="w-full">
                                        <TableHeader className="text-xs uppercase text-muted-foreground font-bold">
                                        <TableRow>
                                            <TableHead className="font-normal w-1/2">Name</TableHead>
                                            <TableHead className="font-normal w-1/4">Grams</TableHead>
                                            <TableHead className="font-normal text-right w-1/4"></TableHead>
                                        </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {meals[mealType] && meals[mealType].length > 0 ? (
                                                meals[mealType].map((food: FoodItem, index: number) => (
                                                    <TableRow key={`${mealType}-${index}`}>
                                                        <TableCell className="font-medium">
                                                            {food.productName}
                                                        </TableCell>

                                                        <TableCell>{food.grams}g</TableCell>

                                                        <TableCell className="text-right">
                                                            <AlertDialog 
                                                                open={foodSpecsDialogsOpen[`${mealType}-${index}`] || false}
                                                                onOpenChange={(isOpen) =>
                                                                    setFoodSpecsDialogsOpen((prevState) => ({
                                                                        ...prevState,
                                                                        [`${mealType}-${index}`]: isOpen,
                                                                    }))
                                                                }
                                                            >
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost"><Eye className="h-4 w-4" /></Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                    <AlertDialogTitle>Food Specifics</AlertDialogTitle>
                                                                    </AlertDialogHeader>
                                                                    <div className="p-4 flex">
                                                                        <img 
                                                                            src={food.image} 
                                                                            alt={food.productName} 
                                                                            className="w-48 object-cover rounded-lg mr-6 shadow-md"  // Enhanced image styling
                                                                        />
                                                                        <div className="flex-1">
                                                                            <h3 className="text-lg font-semibold mb-2">{food.productName}</h3>
                                                                            <p className="text-gray-600 mb-2">Barcode: {food.barcode}</p>
                                                                                <h4 className="text-md font-semibold mb-1">Nutrients for Your Serving ({food.grams}g):</h4> {/* Title for Your Serving */}
                                                                                <div className="grid grid-cols-2 gap-2"> {/* Grid for nutriments for your serving */}
                                                                                    <div>
                                                                                        <p className="text-sm font-medium">Calories:</p>
                                                                                        <p className="text-lg">{Math.round((food.calories ?? 0) * (food.grams / 100))} kcal</p>
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-sm font-medium">Carbs:</p>
                                                                                        <p className="text-lg">{Math.round((food.carbohydrates ?? 0) * (food.grams / 100))} g</p>
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-sm font-medium">Protein:</p>
                                                                                        <p className="text-lg">{Math.round((food.proteins ?? 0) * (food.grams / 100))} g</p>
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-sm font-medium">Fat:</p>
                                                                                        <p className="text-lg">{Math.round((food.fats ?? 0) * (food.grams / 100))} g</p>
                                                                                    </div>
                                                                                </div>

                                                                                <h4 className="text-md font-semibold mt-3 mb-1">Nutrients per 100g:</h4> {/* Title for 100g */}
                                                                                <div className="grid grid-cols-2 gap-2"> {/* Grid for nutriments for 100grams */}
                                                                                    <div>
                                                                                        <p className="text-sm font-medium">Calories:</p>
                                                                                        <p className="text-lg">{Math.round(food.calories ?? 0)} kcal</p>
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-sm font-medium">Carbs:</p>
                                                                                        <p className="text-lg">{Math.round(food.carbohydrates ?? 0)} g</p>
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-sm font-medium">Protein:</p>
                                                                                        <p className="text-lg">{Math.round(food.proteins ?? 0)} g</p>
                                                                                    </div>
                                                                                    <div>
                                                                                        <p className="text-sm font-medium">Fat:</p>
                                                                                        <p className="text-lg">{Math.round(food.fats ?? 0)} g</p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    <AlertDialogFooter>
                                                                    <AlertDialogCancel>Close</AlertDialogCancel>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>


                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteFoodItem(meals?._id.toString(), index.toString(), mealType)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={3}
                                                        className="text-muted-foreground text-center"
                                                    >
                                                        No {mealType} items added yet.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </Card>
                            ))}
                        </div>
                    </>
                ) : null
                }
            </div>
        </>
    );
};
  
export default UserMeals;