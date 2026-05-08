export function calculateCalories(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female',
  routine: string
) {
  // Mifflin-St Jeor Equation
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  // Activity Multipliers
  let multiplier = 1.2; // Sedentary
  if (routine.includes('Lightly Active')) multiplier = 1.375;
  if (routine.includes('Moderately Active')) multiplier = 1.55;
  if (routine.includes('Very Active')) multiplier = 1.725;

  const tdee = Math.round(bmr * multiplier);
  return {
    maintenance: tdee,
    leanCut: tdee - 500,
    bulk: tdee + 500
  };
}

export function getMacroBreakdown(calories: number, weight: number) {
  // Protein: 2g per kg of body weight (standard for active people)
  const proteinGrams = Math.round(weight * 2);
  const proteinCals = proteinGrams * 4;

  // Fat: 25% of total calories
  const fatCals = Math.round(calories * 0.25);
  const fatGrams = Math.round(fatCals / 9);

  // Carbs: Remainder
  const carbCals = calories - proteinCals - fatCals;
  const carbGrams = Math.round(carbCals / 4);

  return {
    protein: proteinGrams,
    carbs: carbGrams,
    fat: fatGrams
  };
}
