import { useMemo } from 'react';

export const useFormatWalkTime = (date: Date): string => {
  return useMemo(() => {
    const now = new Date();
    const walkDate = new Date(date);

    // Сбрасываем время до начала дня для сравнения дат
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const walkDateStart = new Date(walkDate.getFullYear(), walkDate.getMonth(), walkDate.getDate());
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    // Форматируем время (HH:MM)
    const hours = String(walkDate.getHours()).padStart(2, '0');
    const minutes = String(walkDate.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    // Если прогулка сегодня - показываем только время
    if (walkDateStart.getTime() === todayStart.getTime()) {
      return timeString;
    }

    // Если прогулка завтра - показываем "Завтра" + время
    if (walkDateStart.getTime() === tomorrowStart.getTime()) {
      return `Завтра ${timeString}`;
    }

    // Если прогулка в другой день - показываем дату (дд.мм) + время
    const day = String(walkDate.getDate()).padStart(2, '0');
    const month = String(walkDate.getMonth() + 1).padStart(2, '0');
    return `${day}.${month} ${timeString}`;
  }, [date]);
};
