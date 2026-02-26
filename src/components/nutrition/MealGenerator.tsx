import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Utensils, Apple, Coffee, Drumstick, Loader2 } from "lucide-react";
import { useMealGenerator } from "@/hooks/useMealGenerator";
import { useTranslation } from "react-i18next";

export const MealGenerator = () => {
  const { t } = useTranslation("nutrition");
  const { generatedMeal, isGenerating, generateMeal } = useMealGenerator();
  
  const [protein, setProtein] = useState([50]);
  const [carbs, setCarbs] = useState([100]);
  const [fats, setFats] = useState([30]);
  const [type, setType] = useState<"sweet" | "salty">("salty");
  const [category, setCategory] = useState<"breakfast" | "lunch" | "dinner" | "snack">("lunch");

  const handleGenerate = () => {
    generateMeal({ protein: protein[0], carbs: carbs[0], fats: fats[0], type, category });
  };

  const getCategoryIcon = () => {
    switch (category) {
      case "breakfast": return <Coffee className="w-5 h-5" />;
      case "lunch": return <Utensils className="w-5 h-5" />;
      case "dinner": return <Drumstick className="w-5 h-5" />;
      case "snack": return <Apple className="w-5 h-5" />;
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20 shadow-lg shadow-primary/5 backdrop-blur-xl transition-all duration-300 hover:border-primary/50">
      <h3 className="text-lg font-bold mb-4">{t("mealGenerator.title", { defaultValue: "🍽️ Meal generator" })}</h3>
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm font-semibold mb-2 block">{t("proteins")} : <span className="text-primary">{protein[0]}g</span></label>
          <Slider value={protein} onValueChange={setProtein} min={10} max={150} step={5} className="w-full" />
        </div>
        <div>
          <label className="text-sm font-semibold mb-2 block">{t("carbs")} : <span className="text-accent">{carbs[0]}g</span></label>
          <Slider value={carbs} onValueChange={setCarbs} min={10} max={200} step={5} className="w-full" />
        </div>
        <div>
          <label className="text-sm font-semibold mb-2 block">{t("fats")} : <span className="text-secondary">{fats[0]}g</span></label>
          <Slider value={fats} onValueChange={setFats} min={5} max={100} step={5} className="w-full" />
        </div>
        <div>
          <label className="text-sm font-semibold mb-2 block">{t("mealGenerator.type", { defaultValue: "Type" })}</label>
          <Select value={type} onValueChange={(v) => setType(v as "sweet" | "salty")}>
            <SelectTrigger className="bg-background/50 border-primary/20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="salty">{t("mealGenerator.savory", { defaultValue: "Savory 🧂" })}</SelectItem>
              <SelectItem value="sweet">{t("mealGenerator.sweet", { defaultValue: "Sweet 🍰" })}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-semibold mb-2 block">{t("mealGenerator.category", { defaultValue: "Category" })}</label>
          <Select value={category} onValueChange={(v) => setCategory(v as any)}>
            <SelectTrigger className="bg-background/50 border-primary/20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">{t("mealGenerator.breakfast", { defaultValue: "Breakfast" })}</SelectItem>
              <SelectItem value="lunch">{t("mealGenerator.lunch", { defaultValue: "Lunch" })}</SelectItem>
              <SelectItem value="dinner">{t("mealGenerator.dinner", { defaultValue: "Dinner" })}</SelectItem>
              <SelectItem value="snack">{t("mealGenerator.snack", { defaultValue: "Snack" })}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300">
          {isGenerating ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t("mealGenerator.generating", { defaultValue: "Generating..." })}</>) : (<><Utensils className="w-4 h-4 mr-2" />{t("mealGenerator.generate", { defaultValue: "Generate my meal" })}</>)}
        </Button>
      </div>
      {generatedMeal && (
        <div className="p-4 rounded-lg bg-background/40 border border-primary/20 space-y-3 animate-fade-in">
          <div className="flex items-center gap-2">{getCategoryIcon()}<h4 className="font-bold text-lg">{generatedMeal.name}</h4></div>
          <p className="text-sm text-muted-foreground">{generatedMeal.description}</p>
          <div className="flex gap-2 flex-wrap">
            <Badge className="bg-primary/20 text-primary border-primary/30">P: {generatedMeal.macros.protein}g</Badge>
            <Badge className="bg-accent/20 text-accent border-accent/30">G: {generatedMeal.macros.carbs}g</Badge>
            <Badge className="bg-secondary/20 text-secondary border-secondary/30">L: {generatedMeal.macros.fats}g</Badge>
            <Badge className="bg-muted/50 border-muted">{generatedMeal.macros.calories} kcal</Badge>
          </div>
          {generatedMeal.ingredients && (
            <div>
              <p className="text-xs font-semibold mb-1">{t("mealGenerator.ingredients", { defaultValue: "Ingredients:" })}</p>
              <ul className="text-xs text-muted-foreground space-y-1">{generatedMeal.ingredients.map((ing, i) => (<li key={i}>• {ing}</li>))}</ul>
            </div>
          )}
          {generatedMeal.instructions && (
            <div>
              <p className="text-xs font-semibold mb-1">{t("mealGenerator.instructions", { defaultValue: "Instructions:" })}</p>
              <ol className="text-xs text-muted-foreground space-y-1">{generatedMeal.instructions.map((inst, i) => (<li key={i}>{i + 1}. {inst}</li>))}</ol>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
