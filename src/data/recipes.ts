export type Recipe = {
  id: number;
  name: string;
  category: "petit-déjeuner" | "déjeuner" | "dîner" | "snack";
  prepTime: number;
  kcal: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
  instructions: string[];
};

export const recipes: Recipe[] = [
  // Petit-déjeuners
  {
    id: 1,
    name: "Overnight Oats Protéiné",
    category: "petit-déjeuner",
    prepTime: 5,
    kcal: 380,
    protein: 25,
    carbs: 52,
    fats: 8,
    ingredients: ["50g flocons d'avoine", "200ml lait écrémé", "1 scoop whey vanille", "100g myrtilles", "10g amandes"],
    instructions: ["Mélanger avoine, lait et whey", "Réfrigérer toute la nuit", "Ajouter fruits et amandes le matin"]
  },
  {
    id: 2,
    name: "Omelette Sportive",
    category: "petit-déjeuner",
    prepTime: 10,
    kcal: 350,
    protein: 32,
    carbs: 24,
    fats: 12,
    ingredients: ["3 oeufs entiers", "100g épinards", "50g fromage blanc", "2 tranches pain complet"],
    instructions: ["Battre les oeufs avec fromage blanc", "Cuire avec épinards", "Servir avec pain grillé"]
  },
  {
    id: 3,
    name: "Pancakes Protéinés",
    category: "petit-déjeuner",
    prepTime: 15,
    kcal: 420,
    protein: 28,
    carbs: 58,
    fats: 9,
    ingredients: ["2 oeufs", "50g flocons d'avoine mixés", "1 banane", "1 scoop whey", "Miel"],
    instructions: ["Mixer tous ingrédients sauf miel", "Cuire comme des pancakes", "Napper de miel"]
  },
  
  // Déjeuners
  {
    id: 4,
    name: "Bowl Buddha Poulet",
    category: "déjeuner",
    prepTime: 20,
    kcal: 620,
    protein: 48,
    carbs: 72,
    fats: 14,
    ingredients: ["150g poulet", "100g quinoa cuit", "100g patate douce", "Avocat 1/4", "Légumes variés"],
    instructions: ["Cuire quinoa et patate douce", "Griller le poulet", "Assembler dans un bol avec légumes"]
  },
  {
    id: 5,
    name: "Pâtes Bolognaise Maigre",
    category: "déjeuner",
    prepTime: 25,
    kcal: 580,
    protein: 42,
    carbs: 78,
    fats: 10,
    ingredients: ["100g pâtes complètes", "120g boeuf haché 5%", "Sauce tomate maison", "Légumes"],
    instructions: ["Cuire les pâtes al dente", "Faire revenir viande et sauce", "Mélanger et servir"]
  },
  {
    id: 6,
    name: "Riz Poulet Teriyaki",
    category: "déjeuner",
    prepTime: 30,
    kcal: 640,
    protein: 50,
    carbs: 82,
    fats: 12,
    ingredients: ["150g poulet", "100g riz basmati", "Sauce teriyaki light", "Brocolis", "Carottes"],
    instructions: ["Cuire le riz", "Faire sauter poulet et légumes", "Ajouter sauce teriyaki"]
  },
  {
    id: 7,
    name: "Wrap Thon Méditerranéen",
    category: "déjeuner",
    prepTime: 10,
    kcal: 480,
    protein: 38,
    carbs: 54,
    fats: 12,
    ingredients: ["1 wrap complet", "120g thon au naturel", "Tomates", "Concombre", "Fromage blanc 0%"],
    instructions: ["Étaler fromage blanc sur wrap", "Ajouter thon et légumes", "Rouler et déguster"]
  },

  // Dîners
  {
    id: 8,
    name: "Saumon Quinoa Asperges",
    category: "dîner",
    prepTime: 25,
    kcal: 560,
    protein: 42,
    carbs: 48,
    fats: 20,
    ingredients: ["130g saumon", "80g quinoa", "150g asperges vertes", "Citron", "Herbes"],
    instructions: ["Cuire quinoa", "Griller saumon avec citron", "Cuire asperges vapeur"]
  },
  {
    id: 9,
    name: "Dinde Riz Légumes",
    category: "dîner",
    prepTime: 20,
    kcal: 520,
    protein: 44,
    carbs: 62,
    fats: 10,
    ingredients: ["140g escalope dinde", "80g riz complet", "Haricots verts", "Courgettes"],
    instructions: ["Cuire le riz", "Griller la dinde", "Cuire légumes vapeur"]
  },
  {
    id: 10,
    name: "Omelette Légumes du Soir",
    category: "dîner",
    prepTime: 15,
    kcal: 340,
    protein: 28,
    carbs: 18,
    fats: 18,
    ingredients: ["3 oeufs", "Poivrons", "Oignons", "Champignons", "Fromage light"],
    instructions: ["Faire revenir légumes", "Ajouter oeufs battus", "Cuire et gratiner fromage"]
  },

  // Snacks
  {
    id: 11,
    name: "Yaourt Grec Fruits Rouges",
    category: "snack",
    prepTime: 2,
    kcal: 180,
    protein: 18,
    carbs: 22,
    fats: 3,
    ingredients: ["150g yaourt grec 0%", "80g fruits rouges", "5g miel"],
    instructions: ["Mélanger yaourt et fruits", "Ajouter miel"]
  },
  {
    id: 12,
    name: "Smoothie Protéiné Banane",
    category: "snack",
    prepTime: 5,
    kcal: 280,
    protein: 24,
    carbs: 38,
    fats: 4,
    ingredients: ["1 banane", "200ml lait écrémé", "1 scoop whey", "Glaçons"],
    instructions: ["Mixer tous ingrédients", "Servir frais"]
  },
  {
    id: 13,
    name: "Cottage Cheese Bowl",
    category: "snack",
    prepTime: 3,
    kcal: 210,
    protein: 22,
    carbs: 26,
    fats: 2,
    ingredients: ["150g cottage cheese", "1 pomme", "Cannelle", "10g noix"],
    instructions: ["Couper pomme en dés", "Mélanger avec cottage", "Saupoudrer cannelle et noix"]
  },
  {
    id: 14,
    name: "Rice Cakes Beurre de Cacahuète",
    category: "snack",
    prepTime: 2,
    kcal: 240,
    protein: 12,
    carbs: 32,
    fats: 8,
    ingredients: ["2 galettes de riz", "20g beurre cacahuète", "1/2 banane"],
    instructions: ["Tartiner beurre cacahuète", "Ajouter tranches banane"]
  },
  {
    id: 15,
    name: "Fromage Blanc Compote",
    category: "snack",
    prepTime: 1,
    kcal: 150,
    protein: 16,
    carbs: 20,
    fats: 1,
    ingredients: ["150g fromage blanc 0%", "100g compote sans sucre", "Cannelle"],
    instructions: ["Mélanger fromage et compote", "Saupoudrer cannelle"]
  },

  // Plus de recettes variées
  {
    id: 16,
    name: "Porridge Pomme Cannelle",
    category: "petit-déjeuner",
    prepTime: 8,
    kcal: 360,
    protein: 14,
    carbs: 62,
    fats: 7,
    ingredients: ["50g flocons avoine", "200ml lait amande", "1 pomme", "Cannelle", "10g noix"],
    instructions: ["Cuire avoine dans lait", "Ajouter pomme râpée", "Garnir noix et cannelle"]
  },
  {
    id: 17,
    name: "Tartines Avocat Saumon",
    category: "petit-déjeuner",
    prepTime: 10,
    kcal: 420,
    protein: 24,
    carbs: 36,
    fats: 22,
    ingredients: ["2 tranches pain complet", "1/2 avocat", "60g saumon fumé", "Citron"],
    instructions: ["Griller le pain", "Écraser avocat dessus", "Ajouter saumon et citron"]
  },
  {
    id: 18,
    name: "Salade César Poulet",
    category: "déjeuner",
    prepTime: 15,
    kcal: 520,
    protein: 46,
    carbs: 32,
    fats: 22,
    ingredients: ["150g poulet grillé", "Laitue romaine", "Parmesan 20g", "Sauce César light", "Croûtons"],
    instructions: ["Couper laitue et poulet", "Mélanger avec sauce", "Garnir parmesan et croûtons"]
  },
  {
    id: 19,
    name: "Curry Poulet Légumes",
    category: "dîner",
    prepTime: 30,
    kcal: 580,
    protein: 44,
    carbs: 68,
    fats: 14,
    ingredients: ["140g poulet", "80g riz basmati", "Lait coco light", "Curry", "Légumes mix"],
    instructions: ["Cuire riz", "Faire mijoter poulet curry et lait coco", "Ajouter légumes"]
  },
  {
    id: 20,
    name: "Tacos Boeuf Healthy",
    category: "dîner",
    prepTime: 25,
    kcal: 540,
    protein: 42,
    carbs: 52,
    fats: 16,
    ingredients: ["120g boeuf haché 5%", "2 tortillas complètes", "Haricots noirs", "Salsa", "Coriandre"],
    instructions: ["Faire revenir viande épicée", "Réchauffer tortillas", "Garnir viande, haricots, salsa"]
  },
  {
    id: 21,
    name: "Poké Bowl Thon",
    category: "déjeuner",
    prepTime: 20,
    kcal: 600,
    protein: 46,
    carbs: 70,
    fats: 12,
    ingredients: ["130g thon frais", "100g riz sushi", "Edamame", "Avocat 1/4", "Sauce soja"],
    instructions: ["Cuire riz sushi", "Couper thon en cubes", "Assembler bowl avec légumes"]
  },
  {
    id: 22,
    name: "Pizza Protéinée Maison",
    category: "dîner",
    prepTime: 35,
    kcal: 620,
    protein: 48,
    carbs: 64,
    fats: 18,
    ingredients: ["Pâte complète", "120g poulet", "Mozzarella light", "Sauce tomate", "Légumes"],
    instructions: ["Étaler pâte", "Garnir sauce, poulet, fromage", "Cuire 15min à 220°C"]
  },
  {
    id: 23,
    name: "Barres Protéinées Maison",
    category: "snack",
    prepTime: 40,
    kcal: 220,
    protein: 12,
    carbs: 28,
    fats: 8,
    ingredients: ["100g flocons avoine", "2 scoops whey", "Miel 30g", "Beurre cacahuète 40g"],
    instructions: ["Mélanger tous ingrédients", "Presser dans moule", "Réfrigérer 2h"]
  },
  {
    id: 24,
    name: "Wraps Fajitas Poulet",
    category: "dîner",
    prepTime: 20,
    kcal: 560,
    protein: 44,
    carbs: 58,
    fats: 14,
    ingredients: ["140g poulet", "2 wraps complets", "Poivrons", "Oignons", "Épices tex-mex"],
    instructions: ["Faire sauter poulet et légumes épicés", "Réchauffer wraps", "Garnir et rouler"]
  },
  {
    id: 25,
    name: "Chili Con Carne Light",
    category: "dîner",
    prepTime: 40,
    kcal: 540,
    protein: 46,
    carbs: 62,
    fats: 10,
    ingredients: ["140g boeuf haché 5%", "Haricots rouges", "Tomates", "80g riz", "Épices chili"],
    instructions: ["Faire mijoter viande, haricots, tomates", "Cuire riz séparément", "Servir ensemble"]
  },
  {
    id: 26,
    name: "Soupe Repas Lentilles",
    category: "dîner",
    prepTime: 35,
    kcal: 420,
    protein: 26,
    carbs: 68,
    fats: 6,
    ingredients: ["120g lentilles", "Carottes", "Céleri", "Bouillon légumes", "Épices"],
    instructions: ["Faire revenir légumes", "Ajouter lentilles et bouillon", "Mijoter 30min"]
  },
  {
    id: 27,
    name: "Burger Maison Healthy",
    category: "déjeuner",
    prepTime: 25,
    kcal: 580,
    protein: 44,
    carbs: 56,
    fats: 16,
    ingredients: ["120g steak haché 5%", "Pain burger complet", "Salade", "Tomate", "Sauce light"],
    instructions: ["Griller steak", "Toaster pain", "Assembler burger avec légumes"]
  },
  {
    id: 28,
    name: "Stir-Fry Crevettes",
    category: "dîner",
    prepTime: 20,
    kcal: 480,
    protein: 42,
    carbs: 58,
    fats: 8,
    ingredients: ["150g crevettes", "80g nouilles riz", "Légumes asiatiques", "Sauce soja", "Gingembre"],
    instructions: ["Cuire nouilles", "Faire sauter crevettes et légumes", "Ajouter sauce et mélanger"]
  },
  {
    id: 29,
    name: "Muffins Protéinés Myrtilles",
    category: "snack",
    prepTime: 30,
    kcal: 200,
    protein: 14,
    carbs: 26,
    fats: 4,
    ingredients: ["2 scoops whey", "50g farine avoine", "2 oeufs", "Myrtilles 50g", "Lait"],
    instructions: ["Mélanger tous ingrédients", "Verser dans moules muffins", "Cuire 20min à 180°C"]
  },
  {
    id: 30,
    name: "Energy Balls Dattes",
    category: "snack",
    prepTime: 15,
    kcal: 180,
    protein: 8,
    carbs: 28,
    fats: 6,
    ingredients: ["100g dattes", "30g amandes", "20g flocons avoine", "Cacao 10g"],
    instructions: ["Mixer tous ingrédients", "Former boules", "Réfrigérer 1h"]
  }
];
