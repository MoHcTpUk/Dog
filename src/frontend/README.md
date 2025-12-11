# DogApp Frontend

Ionic React приложение для мобильных платформ (iOS, Android) и веба, построенное на Vite, TypeScript и Tailwind CSS.

## 📋 Содержание

- [Установка](#установка)
- [Разработка в вебе](#разработка-в-вебе)
- [Разработка на iOS](#разработка-на-ios)
- [Разработка на Android](#разработка-на-android)
- [Hot Reload](#hot-reload)
- [Сборка для продакшена](#сборка-для-продакшена)
- [Доступные команды](#доступные-команды)
- [Решение проблем](#решение-проблем)

## 🚀 Установка

```bash
npm install
```

## 💻 Разработка в вебе

Самый простой способ разработки - запустить dev сервер и открыть приложение в браузере:

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:5173`

Для предпросмотра production сборки:

```bash
npm run build
npm run preview
```

## 📱 Разработка на iOS

### Первоначальная настройка

1. **Установите зависимости:**

   ```bash
   npm install
   ```

2. **Добавьте iOS платформу (если еще не добавлена):**

   ```bash
   npx cap add ios
   ```

3. **Настройте подпись кода в Xcode:**

   ```bash
   npm run ios:open
   # или
   npx cap open ios
   ```

   В Xcode:

   - Выберите проект "App" в левой панели
   - Выберите таргет "App"
   - Перейдите на вкладку "Signing & Capabilities"
   - Включите "Automatically manage signing"
   - Выберите вашу команду разработчика (Team)

4. **Соберите проект:**
   ```bash
   npm run build
   npm run ios:sync
   ```

### Разработка с Hot Reload

**Вариант 1: Использование npm скриптов (рекомендуется)**

1. **Терминал 1** - Запустите dev сервер:

   ```bash
   npm run dev
   ```

   Убедитесь, что сервер доступен по сети:

   ```
   ➜  Local:   http://localhost:5173/
   ➜  Network: http://192.168.0.119:5173/
   ```

2. **Терминал 2** - Запустите приложение на устройстве:
   ```bash
   npm run ios:sync:run
   ```

**Вариант 2: Использование shell скрипта (из корня проекта)**

```bash
# Из корня проекта:
./scripts/ios_dev.sh sync:run
```

### Запуск на конкретном устройстве

Если нужно запустить на конкретном устройстве, используйте:

```bash
npx cap run ios --target="<DEVICE_ID>"
```

Чтобы узнать ID устройства:

```bash
xcrun xctrace list devices
```

### Доступные команды для iOS

```bash
# Открыть проект в Xcode
npm run ios:open

# Синхронизировать изменения
npm run ios:sync

# Запустить на устройстве
npm run ios:run

# Синхронизировать и запустить
npm run ios:sync:run

# Полная пересборка, синхронизация и запуск
npm run ios:build:sync:run
```

## 🤖 Разработка на Android

### Первоначальная настройка

1. **Установите зависимости:**

   ```bash
   npm install
   ```

2. **Добавьте Android платформу (если еще не добавлена):**

   ```bash
   npx cap add android
   ```

3. **Откройте проект в Android Studio:**

   ```bash
   npm run android:open
   ```

4. **Соберите проект:**
   ```bash
   npm run build
   npm run android:sync
   ```

### Разработка с Hot Reload

**Вариант 1: Использование npm скриптов (рекомендуется)**

1. **Терминал 1** - Запустите dev сервер:

   ```bash
   npm run dev
   ```

2. **Терминал 2** - Запустите приложение:
   ```bash
   npm run android:sync:run
   ```

**Вариант 2: Использование Android Studio**

1. Запустите dev сервер: `npm run dev`
2. Откройте проект: `npm run android:open`
3. Запустите приложение из Android Studio на эмуляторе/устройстве

### Настройка для HTTP (cleartext traffic)

Для работы с dev сервером через HTTP, добавьте в `android/app/src/main/AndroidManifest.xml`:

```xml
<application
    android:usesCleartextTraffic="true"
    ...>
    ...
</application>
```

## 🔥 Hot Reload

Hot Reload позволяет видеть изменения в коде на мобильном устройстве в реальном времени без переустановки приложения.

### Настройка Hot Reload

1. **Узнайте ваш локальный IP адрес:**

   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1

   # Windows
   ipconfig
   ```

2. **Настройте `capacitor.config.ts`:**

   ```typescript
   import { CapacitorConfig } from "@capacitor/cli";

   const config: CapacitorConfig = {
     appId: "com.antonmalay.dogapp",
     appName: "frontend",
     webDir: "dist",

     // Для hot reload - раскомментируйте:
     server: {
       url: "http://ВАШ_IP:5173", // Замените на ваш IP
       cleartext: true,
     },

     plugins: {
       // ...
     },
   };

   export default config;
   ```

3. **Убедитесь, что dev сервер запущен с флагом `--host`:**

   ```bash
   npm run dev
   ```

   Флаг `--host` уже добавлен в скрипт `dev` в `package.json`.

4. **Для iOS - настройте Info.plist:**

   В `ios/App/App/Info.plist` должны быть настройки для HTTP:

   ```xml
   <key>NSAppTransportSecurity</key>
   <dict>
       <key>NSAllowsArbitraryLoads</key>
       <true/>
       <key>NSAllowsLocalNetworking</key>
       <true/>
   </dict>
   ```

   Эти настройки уже добавлены автоматически при синхронизации.

5. **Для Android - настройте AndroidManifest.xml:**

   В `android/app/src/main/AndroidManifest.xml`:

   ```xml
   <application
       android:usesCleartextTraffic="true"
       ...>
   ```

### Использование Hot Reload

1. Запустите dev сервер: `npm run dev`
2. Запустите приложение на устройстве: `npm run ios:sync:run` или `npm run android:sync:run`
3. Внесите изменения в код
4. Сохраните файл
5. Приложение автоматически обновится на устройстве

**Важно:**

- Убедитесь, что телефон и компьютер в одной Wi-Fi сети
- IP адрес может измениться при переподключении к сети
- Для продакшена обязательно закомментируйте `server` блок в конфиге

## 📦 Сборка для продакшена

### Подготовка

1. **Уберите server из конфига:**

   В `capacitor.config.ts` закомментируйте или удалите:

   ```typescript
   // server: {
   //   url: "http://192.168.0.119:5173",
   //   cleartext: true,
   // },
   ```

2. **Соберите проект:**

   ```bash
   npm run build
   ```

3. **Синхронизируйте с нативными платформами:**
   ```bash
   npm run ios:sync
   npm run android:sync
   ```

### iOS - Сборка в Xcode

1. Откройте проект:

   ```bash
   npm run ios:open
   ```

2. В Xcode:

   - Выберите схему "App"
   - Выберите устройство или "Any iOS Device"
   - **Product → Build** (⌘+B) - для тестирования
   - **Product → Archive** - для публикации в App Store

3. Для публикации:
   - **Window → Organizer**
   - Выберите архив
   - **Distribute App**

### Android - Сборка в Android Studio

1. Откройте проект:

   ```bash
   npm run android:open
   ```

2. В Android Studio:

   - **Build → Make Project** - для тестирования
   - **Build → Generate Signed Bundle/APK** - для публикации

3. Или через командную строку:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

## 📜 Доступные команды

### Разработка

```bash
npm run dev              # Запуск dev сервера с hot reload (--host)
npm run build            # Сборка для продакшена
npm run preview          # Предпросмотр production сборки
```

### iOS

```bash
npm run ios:open         # Открыть проект в Xcode
npm run ios:sync         # Синхронизировать изменения
npm run ios:run          # Запустить на устройстве
npm run ios:sync:run     # Синхронизировать и запустить
npm run ios:build:sync:run # Полная пересборка, синхронизация и запуск
```

### Android

```bash
npm run android:open         # Открыть проект в Android Studio
npm run android:sync          # Синхронизировать изменения
npm run android:run           # Запустить на устройстве/эмуляторе
npm run android:sync:run      # Синхронизировать и запустить
npm run android:build:sync:run # Полная пересборка, синхронизация и запуск
```

### Тестирование

```bash
npm run test.unit        # Запуск unit тестов (Vitest)
npm run test.e2e         # Запуск E2E тестов (Cypress)
npm run lint             # Проверка кода (ESLint)
```

### API

```bash
npm run api:generate     # Генерация API клиента из OpenAPI spec
npm run api:watch        # Отслеживание изменений OpenAPI и регенерация
npm run api:clean        # Удаление сгенерированных API файлов
```

### Shell скрипты (из корня проекта)

```bash
./scripts/ios_dev.sh open          # Открыть проект в Xcode
./scripts/ios_dev.sh sync          # Синхронизация iOS
./scripts/ios_dev.sh run           # Запуск на устройстве
./scripts/ios_dev.sh sync:run      # Синхронизация и запуск
./scripts/ios_dev.sh build:sync:run # Полная пересборка
```

## 🔧 Решение проблем

### Белый экран на iOS/Android

**Проблема:** Приложение показывает белый экран.

**Решения:**

1. Убедитесь, что dev сервер запущен и доступен по сети
2. Проверьте IP адрес в `capacitor.config.ts` - он должен совпадать с IP вашего компьютера
3. Убедитесь, что телефон и компьютер в одной Wi-Fi сети
4. Для iOS проверьте настройки `Info.plist` для HTTP (см. раздел Hot Reload)
5. Для Android проверьте `AndroidManifest.xml` - должен быть `android:usesCleartextTraffic="true"`
6. Попробуйте временно убрать `server.url` из конфига и использовать собранные файлы:
   ```bash
   npm run build
   npm run ios:sync:run
   ```

### Ошибка подписи кода (iOS)

**Проблема:** `Signing for "App" requires a development team`

**Решение:**

1. Откройте проект в Xcode: `npm run ios:open`
2. Выберите проект → таргет "App" → "Signing & Capabilities"
3. Включите "Automatically manage signing"
4. Выберите вашу команду разработчика (Team)

### CocoaPods ошибка кодировки

**Проблема:** `Unicode Normalization not appropriate for ASCII-8BIT`

**Решение:**
Добавьте в начало команд:

```bash
export LANG=en_US.UTF-8
```

Или добавьте в `~/.zshrc`:

```bash
export LANG=en_US.UTF-8
```

Команды в `package.json` уже включают эту настройку.

### Изменения не применяются

**Проблема:** Изменения в коде не видны на устройстве.

**Решения:**

1. Убедитесь, что dev сервер запущен
2. Синхронизируйте изменения: `npm run ios:sync` или `npm run android:sync`
3. Перезапустите приложение на устройстве
4. Проверьте, что `server.url` правильно настроен в `capacitor.config.ts`

### Dev сервер недоступен по сети

**Проблема:** Сервер слушает только на localhost.

**Решение:**
Убедитесь, что используете команду `npm run dev` (в `package.json` уже добавлен флаг `--host`).

Если запускаете напрямую через `vite`, используйте:

```bash
vite --host
```

### Android не видит устройство

**Проблема:** `npx cap run android` не находит устройство.

**Решение:**

1. Включите "Отладка по USB" на Android устройстве
2. Установите USB драйверы для вашего устройства
3. Проверьте подключение: `adb devices`
4. Или используйте Android Studio для запуска

### iOS sandbox ошибка

**Проблема:** Ошибки при сборке iOS проекта.

**Решение:**

```bash
chmod +x "ios/Pods/Target Support Files/Pods-App/Pods-App-frameworks.sh"
```

## 📚 Дополнительная информация

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Ionic React Documentation](https://ionicframework.com/docs/react)
- [Vite Documentation](https://vitejs.dev/)

## 🏗️ Архитектура

Проект использует Feature-Sliced Design (FSD) архитектуру:

- `src/shared/` - Общие утилиты, компоненты, API клиент, store, хуки
- `src/entities/` - Бизнес-сущности
- `src/features/` - Логика фич
- `src/widgets/` - Крупные UI блоки (layout компоненты)
- `src/pages/` - Страницы уровня роутинга
- `src/app/` - Инициализация приложения и роутинг

Подробнее см. [CLAUDE.md](./CLAUDE.md)
