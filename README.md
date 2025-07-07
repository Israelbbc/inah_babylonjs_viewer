# INAH BabylonJS Viewer

**INAH BabylonJS Viewer** es un módulo personalizado para Drupal que permite la visualización interactiva de modelos 3D en formato `.glb` utilizando la biblioteca [Babylon.js](https://www.babylonjs.com/). Está diseñado para integrarse de manera transparente en sitios Drupal/Islandora como un *field formatter*, facilitando a los usuarios la inspección y manipulación de objetos tridimensionales directamente desde la interfaz web.

---

## ⚙️ Funcionamiento

Se comparte la liga de un objeto 3D del Repositorio Institucional del Instituto Nacional de Antropología e Historia (INAH):
	https://repositorio.inah.gob.mx/node/614742

---

## 📦 Nombre del módulo

El nombre interno del módulo es: babylonjs_viewer 

Este nombre debe coincidir con la carpeta dentro de `modules/custom/` para que Drupal lo reconozca correctamente.  
Aunque el repositorio se llama `inah_babylonjs_viewer`, **la carpeta y declaración interna del módulo siguen utilizando `babylonjs_viewer`**.

---

## 🧩 Características principales

- Visualización 3D interactiva usando Babylon.js.
- Formateador de campo para archivos de medios (`Media`) con extensiones `.glb`.
- Compatible con dispositivos móviles, pantallas táctiles y navegación Fullscreen.
- Controles personalizados en el visor (zoom, rotación y reinicio de posición).
- Integración simple sin necesidad de configurar vistas personalizadas.

---

## 🚀 Instalación y Configuración

1. **Clonar el repositorio** en el directorio de módulos personalizados:

```bash
cd web/modules/custom/
git clone https://github.com/Israelbbc/inah_babylonjs_viewer.git babylonjs_viewer
```

2. Activar el módulo desde la interfaz de administración o con Drush:
```bash
drush en babylonjs_viewer
```
3. Agregar un campo de medios 3D (Media) al tipo de contenido deseado.

4. Configurar el formateador BabylonJS 3D Viewer en la vista del campo desde el display manager.

---

## 🔗 Dependencias

* Babylon.js CDN
* Drupal >= 10.0
* Un tipo de media configurado para archivos .glb

---

## 👥 Contribuciones

Este módulo fue desarrollado por la Dirección de Innovacion Institucional (DINNI) del Instituto Nacional de Antropología e Historia (INAH) para la visualización del patrimonio digital de tipo modelo 3D .

¡Las contribuciones, sugerencias y reportes de bugs son bienvenidos!

## 👨‍💻 About the Developer

* Israel Bustamante Colín - israel_bustamante@inah.gob.mx
	* Github - https://github.com/Israelbbc
