# 📱 Guía: Ver EventRadar en Android

## 🎯 **OPCIÓN 1: Android Studio (Completo)**

### 1. **Descargar Android Studio:**
```
https://developer.android.com/studio
```

### 2. **Instalación:**
- Descargar el archivo `.exe`
- Ejecutar e instalar con configuración estándar
- Aceptar licencias de SDK

### 3. **Configurar variable de entorno:**
```powershell
# En PowerShell (como administrador)
$env:CAPACITOR_ANDROID_STUDIO_PATH = "C:\Program Files\Android\Android Studio\bin\studio64.exe"

# Para que sea permanente:
[Environment]::SetEnvironmentVariable("CAPACITOR_ANDROID_STUDIO_PATH", "C:\Program Files\Android\Android Studio\bin\studio64.exe", "Machine")
```

### 4. **Abrir proyecto:**
```bash
npx cap open android
```

### 5. **Crear emulador:**
- En Android Studio: **Tools > AVD Manager**
- **Create Virtual Device**
- Seleccionar **Pixel 4** o **Pixel 6**
- Elegir **API 30** (Android 11) o superior
- **Finish**

### 6. **Ejecutar EventRadar:**
- Presionar el botón **▶ Run**
- Seleccionar el emulador creado
- ¡Ver tu app con el logo funcionando!

---

## 🌐 **OPCIÓN 2: Navegador Móvil (Rápido)**

### Ver ahora mismo en tu celular:

1. **Asegúrate que el servidor esté corriendo:**
```bash
npm run dev
```

2. **Obtener la IP de red:**
```
Network: http://192.168.1.83:3000/
```

3. **En tu celular:**
- Conectar a la misma WiFi
- Abrir navegador
- Ir a: `http://192.168.1.83:3000`
- ¡Ver EventRadar con tu logo!

### **Instalar como PWA:**
- En Chrome móvil: **Menú ⋮** > **Agregar a pantalla de inicio**
- ¡Tu logo aparecerá como icono de app!

---

## 📱 **OPCIÓN 3: APK Directo (Avanzado)**

### Si quieres generar APK sin Android Studio:

1. **Instalar solo SDK Command Line Tools:**
```
https://developer.android.com/studio/command-line
```

2. **Generar APK:**
```bash
# En la carpeta android/
./gradlew assembleDebug
```

3. **APK se genera en:**
```
android/app/build/outputs/apk/debug/app-debug.apk
```

4. **Instalar en celular:**
- Transferir APK al celular
- Activar "Fuentes desconocidas"
- Instalar APK

---

## 🚀 **Recomendación Inmediata:**

**Para ver tu logo AHORA MISMO:**

1. ✅ **Navegador móvil** (opción 2) - 2 minutos
2. ⏳ **Android Studio** (opción 1) - 30 minutos de instalación
3. 🔧 **APK directo** (opción 3) - 10 minutos si tienes SDK

¿Cuál prefieres? ¡Podemos empezar con la opción 2 mientras instalas Android Studio!