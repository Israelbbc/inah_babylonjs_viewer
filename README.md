# INAH BabylonJS Viewer

**INAH BabylonJS Viewer** is a custom Drupal module that enables interactive visualization of `.glb` 3D models using the [Babylon.js](https://www.babylonjs.com/) library. It integrates seamlessly into Drupal/Islandora websites as a *field formatter*, allowing users to inspect and manipulate 3D objects directly within the web interface.

---

## ⚙️ How It Works
Here is an example of a 3D object published on the Institutional Repository of the Instituto Nacional de Antropología e Historia (INAH):  
	🔗 https://repositorio.inah.gob.mx/node/614742

---

## 📦 Module Name

The internal name of the module is: `babylonjs_viewer`  
This must match the folder name under `modules/custom/` for Drupal to recognize it.

Although the GitHub repository is named `inah_babylonjs_viewer`, **the module folder and internal declarations still use `babylonjs_viewer`**.

---

## 🧩 Características principales

- Interactive 3D model viewing powered by Babylon.js.
- Field formatter for media files (`Media`) with `.glb` extension.
- Mobile-friendly, touchscreen-compatible, fullscreen-capable viewer.
- Custom viewer controls (zoom, rotation, reset).
- Easy integration—no need to configure custom views.

---

## 🚀 Installation and Setup

1. **Clone the repository** into your custom modules folder:

```bash
cd web/modules/custom/
git clone https://github.com/Israelbbc/inah_babylonjs_viewer.git babylonjs_viewer
```

2. Enable the module via the Drupal admin interface or Drush:
```bash
drush en babylonjs_viewer
```
3. Add a 3D media field (Media with .glb files) to your desired content type.

4. In the "Manage Display" section of your content type, set the formatter to "INAH BabylonJS 3D Model".

---

## 🔗 Dependencies

* Babylon.js CDN
* Drupal >= 10.0
* A media type configured to accept .glb files

---

## 👥 Contribuciones

This module was developed by the Dirección de Innovación Institucional (DINNI) of the Instituto Nacional de Antropología e Historia (INAH) to support the digital dissemination of cultural heritage through 3D models.

Pull requests, suggestions, and issue reports are welcome!

---

## 📌 Version

**Current version:** `v1.0.0`  
**Release date:** Julio 2025  
**Compatibility:** Drupal 9, 10 y 11  
**License:** GPL-2.0-or-later

---

## 👨‍💻 About the Developer

**Israel Bustamante Colín**  
Jefe de Departamento, Dirección de Innovación Institucional (DINNI)  
Instituto Nacional de Antropología e Historia (INAH)  
📧 israel_bustamante@inah.gob.mx  
🐱 GitHub: [Israelbbc](https://github.com/Israelbbc)