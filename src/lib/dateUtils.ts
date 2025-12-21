/**
 * Calculate age from birth date
 */
export const calculateAge = (birthDate: Date | string): number => {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

/**
 * Format birth date for display (DD/MM/YYYY)
 */
export const formatBirthDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR');
};

/**
 * Check if a birth date is valid (age between 15 and 100)
 */
export const isValidBirthDate = (birthDate: Date | string): boolean => {
  const age = calculateAge(birthDate);
  return age >= 15 && age <= 100;
};
