# CenterModal

Центрированное модальное окно с плавной анимацией появления/исчезновения.

## Использование

```tsx
import { CenterModal } from '@shared/ui';

<CenterModal isOpen={isOpen} onClose={handleClose}>
  <div className="p-5 bg-white rounded-2xl flex flex-col gap-10">
    <Text variant="bold-24" color="primary">
      Заголовок
    </Text>
    <Button onClick={handleClose}>Закрыть</Button>
  </div>
</CenterModal>
```

## Важные правила

### ✅ Правильная структура контента

**ВСЕГДА используйте `flex`, НЕ `inline-flex`:**

```tsx
✅ <div className="p-5 bg-white rounded-2xl flex flex-col gap-10">
❌ <div className="p-5 bg-white rounded-2xl inline-flex flex-col gap-10">
```

**НЕ задавайте фиксированную ширину** (например `w-80`, `w-[90%]`):

```tsx
✅ <div className="p-5 bg-white rounded-2xl flex flex-col gap-10">
❌ <div className="w-80 p-5 bg-white rounded-2xl flex flex-col gap-10">
```

### Ширина и центрирование

- Ширина модалки контролируется через CSS модуль: `width: 90%`, `max-width: 448px`
- Центрирование по вертикали и горизонтали через `display: flex` в overlay
- Контент внутри автоматически растягивается на 90% ширины экрана (до 448px max)

### Анимация

- Плавное появление через `opacity` + `scale` + `translateY`
- Длительность: 300ms
- Используется двойной `requestAnimationFrame` для корректной работы с первого раза

## Props

- `isOpen: boolean` - состояние открытия модалки
- `onClose: () => void` - callback при закрытии (клик по overlay или вне контента)
- `children: React.ReactNode` - содержимое модалки

## Особенности

- Блокирует скролл body при открытии
- Создаёт portal в body
- Клик по затемнению (overlay) закрывает модалку
- Клик по контенту НЕ закрывает модалку (stopPropagation)
- z-index: 9999
