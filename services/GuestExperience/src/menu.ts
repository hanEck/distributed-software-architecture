const drinks = [
    {
        id: 1,
        name: "Soda",
        nutrition: ["H"],
        price: 4.4,
    },
    {
        id: 2,
        name: "Beer",
        nutrition: [],
        price: 5.4,
    },
];

const price = [20.2, 10.2];

export async function createMenu() {
    //get Food from Markus
    const meals = await [
        {
            name: "Burger",
            nutrition: ["A", "B", "C"],
        },
        {
            name: "Wiener Schnitzel",
            nutrition: ["D", "E"],
        },
    ];
    //----------------------------------

    //const response = await fetch("FoodPreparation:8085/meals");
    //const meals = await response.json();

    const food = addPriceToFood(meals);
    return {food: food, drinks: drinks};
}

function addPriceToFood(foodNames: { name: string; nutrition: string[]; }[]) {
    let food: { id: number; name: string; nutrition: string[]; price: number; }[]  = [];

    foodNames.forEach((value, index) => {
        const idNumber = ++index;
        const foodItem = {
            id: idNumber,
            name: value.name,
            nutrition: value.nutrition,
            price: price[index - 1],
        };
        food.push(foodItem);
        }
    );

    return food;
}

export async function getMenuItemPrices() {
    const menu = await createMenu();
    let foodPrices: { id: any; price: any; }[] = [];
    let drinkPrices: { id: any; price: any; }[] = [];

   
    menu.food.forEach((value: { id: any; price: any; }) => {
        const menuItem = {
            id: value.id,
            price: value.price
        }
        foodPrices.push(menuItem);
        }
    );

    menu.drinks.forEach((value: { id: any; price: any; }) => {
        const menuItem = {
            id: value.id,
            price: value.price
        }
        drinkPrices.push(menuItem);
        }
    );

    return {food: foodPrices, drinks: drinkPrices};
}
