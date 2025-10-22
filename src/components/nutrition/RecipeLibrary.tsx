import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, ChevronDown, Clock, Flame } from "lucide-react";
import { recipes, Recipe } from "@/data/recipes";

export const RecipeLibrary = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ["petit-déjeuner", "déjeuner", "dîner", "snack"];

  const filtered = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Card className="p-4 bg-card/50 backdrop-blur-xl border-border/50">
      <h3 className="text-sm font-bold mb-3">Bibliothèque de recettes</h3>
      
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une recette..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>

        <div className="flex gap-1 flex-wrap">
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => setSelectedCategory(null)}
          >
            Tous
          </Badge>
          {categories.map(cat => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className="cursor-pointer text-xs capitalize"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filtered.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Aucune recette trouvée
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-start">
            <div className="text-left flex-1">
              <h4 className="font-semibold text-xs">{recipe.name}</h4>
              <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {recipe.prepTime}min
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="h-3 w-3" />
                  {recipe.kcal}kcal
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-right">
                <div className="text-primary font-semibold">{recipe.protein}g P</div>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>
          </div>
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="mt-2 p-3 rounded-lg bg-background/30 border border-border/30 space-y-2">
          <div className="grid grid-cols-3 gap-2 text-xs text-center">
            <div>
              <div className="font-semibold text-primary">{recipe.protein}g</div>
              <div className="text-muted-foreground">Protéines</div>
            </div>
            <div>
              <div className="font-semibold text-accent">{recipe.carbs}g</div>
              <div className="text-muted-foreground">Glucides</div>
            </div>
            <div>
              <div className="font-semibold text-secondary">{recipe.fats}g</div>
              <div className="text-muted-foreground">Lipides</div>
            </div>
          </div>
          
          <div>
            <p className="text-xs font-semibold mb-1">Ingrédients :</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>• {ing}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <p className="text-xs font-semibold mb-1">Préparation :</p>
            <ol className="text-xs text-muted-foreground space-y-0.5">
              {recipe.instructions.map((step, i) => (
                <li key={i}>{i + 1}. {step}</li>
              ))}
            </ol>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
