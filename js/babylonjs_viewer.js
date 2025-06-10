(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.babylonjsViewer = {
    attach: function (context, settings) {
      once('babylonjs-viewer', '.babylonjs-viewer', context).forEach(function (element) {
        const fileUrl = drupalSettings?.babylonjs_viewer?.file_url;

        if (!fileUrl) {
          return;
        }

        const canvas = element.querySelector('canvas');
        if (!canvas) {
          return;
        }

        const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, alpha: true });

        BABYLON.DefaultLoadingScreen.prototype.displayLoadingUI = function () {                                        
           if (this._isLoading) return;
           this._isLoading = true;
           
           const canvas = document.getElementById('babylonjs-canvas');
           const rect = canvas.getBoundingClientRect();
           
           // Creamos el div de carga
           const loadingDiv = document.createElement("div");
           loadingDiv.id = "customLoadingScreenDiv";
           loadingDiv.style.position = 'absolute';
           loadingDiv.style.top = `${canvas.offsetTop}px`;
           loadingDiv.style.left = `${canvas.offsetLeft}px`;
           loadingDiv.style.width = `${canvas.clientWidth}px`;
           loadingDiv.style.height = `${canvas.clientHeight}px`;
           loadingDiv.style.backgroundColor = 'black';  // Fondo negro
           loadingDiv.style.zIndex = '1000';
           loadingDiv.style.display = 'flex';
           loadingDiv.style.alignItems = 'center';
           loadingDiv.style.justifyContent = 'center';

           const loadingImage = document.createElement('img');
           loadingImage.alt = 'Cargando...';
           loadingImage.style.width = '250px';
           loadingImage.style.height = '250px';
           
           // Asignamos la ruta desde drupalSettings
           loadingImage.src = drupalSettings.path.baseUrl + 'sites/default/files/babylonjs_viewer/screen-load.png';
           
           // Agregamos la imagen al div
           loadingDiv.appendChild(loadingImage);
           
           // Agregamos el div al contenedor principal
           canvas.parentElement.appendChild(loadingDiv);

          };                                                                                                          
                                                                                                                       
        BABYLON.DefaultLoadingScreen.prototype.hideLoadingUI = function () {                                           
          const loadingDiv = document.getElementById('customLoadingScreenDiv');                                        
          if (loadingDiv) {                                                                                            
            loadingDiv.remove();                                                                                       
          }                                                                                                            
          this._isLoading = false;                                                                                                                                                                
        };                                                                                                             
                                                                                                                       
        engine.displayLoadingUI(); // .... Mostrar el loading screen 

        const scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0, 0, 0, 0); // Fondo transparente

        let activeCamera;

        BABYLON.SceneLoader.Append("", fileUrl, scene, function () {

          scene.createDefaultCameraOrLight(true, true, true);

          let activeCamera = null;
          scene.cameras.forEach(cam => {
            if (cam instanceof BABYLON.ArcRotateCamera) {
              activeCamera = cam;
            }
          });

          if (!activeCamera) {
            return;
          }

          const initialCameraState = {
            alpha: activeCamera.alpha,
            beta: activeCamera.beta,
            radius: activeCamera.radius,
            target: activeCamera.target.clone()
          };
          
          const initialAlpha = activeCamera.alpha;
          const initialBeta = activeCamera.beta;
          const initialRadius = activeCamera.radius;
          const initialTarget = activeCamera.target.clone();

          // Configurar límites para la cámara
          activeCamera.allowUpsideDown = true;
          activeCamera.lowerBetaLimit = -Infinity;
          activeCamera.upperBetaLimit = Infinity;
          activeCamera.lowerRadiusLimit = initialRadius * -10;
          activeCamera.upperRadiusLimit = initialRadius * 10;

          // 🔵 Agrega una luz direccional desde una posición y dirección específicas
          const directionalLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(0, 1, 0), scene);
          directionalLight.position = new BABYLON.Vector3(5, 5, 5); // desde dónde viene la luz
          directionalLight.intensity = 2.5; // qué tan fuerte es la luz

          
          // Ajustes para que todas las caras estén bien iluminadas
          scene.meshes.forEach(mesh => {
            if (mesh.material) {
              mesh.receiveShadows = false;
              mesh.material.backFaceCulling = false;
              
              if (mesh.material instanceof BABYLON.PBRMaterial) {
                mesh.material.environmentIntensity = 1.5;
                mesh.material.directIntensity = 1;
                mesh.material.shadowIntensity = 0;
              }
            }
          });

          // 🔥 Ahora conectamos los botones
          const controlsContainer = element.querySelector('.viewer-controls');
          if (controlsContainer) {;

            const rotateStep = 0.5;
            const zoomStep = initialRadius * 0.2;

            controlsContainer.querySelector('#resetView')?.addEventListener('click', () => {
              activeCamera.alpha = initialAlpha;
              activeCamera.beta = initialBeta;
              activeCamera.radius = initialRadius;
              activeCamera.target = initialTarget.clone();
            });

            controlsContainer.querySelector('#rotateLeft')?.addEventListener('click', () => {
              activeCamera.alpha += rotateStep;
            });

            controlsContainer.querySelector('#rotateRight')?.addEventListener('click', () => {
              activeCamera.alpha -= rotateStep;
            });

            controlsContainer.querySelector('#rotateUp')?.addEventListener('click', () => {
              activeCamera.beta = Math.max(activeCamera.lowerBetaLimit, activeCamera.beta - rotateStep);
            });

            controlsContainer.querySelector('#rotateDown')?.addEventListener('click', () => {
              activeCamera.beta = Math.min(activeCamera.upperBetaLimit, activeCamera.beta + rotateStep);
            });

            controlsContainer.querySelector('#zoomIn')?.addEventListener('click', () => {
              activeCamera.radius = Math.max(activeCamera.lowerRadiusLimit, activeCamera.radius - zoomStep);
            });

            controlsContainer.querySelector('#zoomOut')?.addEventListener('click', () => {
              activeCamera.radius = Math.min(activeCamera.upperRadiusLimit, activeCamera.radius + zoomStep);
            });
            
            controlsContainer.querySelector('#resetView')?.addEventListener('click', () => {
              activeCamera.alpha = initialCameraState.alpha;
              activeCamera.beta = initialCameraState.beta;
              activeCamera.radius = initialCameraState.radius;
              activeCamera.target = initialCameraState.target.clone();
            });

            const completeViewButton = controlsContainer.querySelector('#completeView');
            if (completeViewButton) {
              completeViewButton.addEventListener('click', () => {
                if (!document.fullscreenElement) {
                  if (element.requestFullscreen) {
                    element.requestFullscreen();
                  } else if (element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                  } else if (element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                  }
                } else {
                  if (document.exitFullscreen) {
                    document.exitFullscreen();
                  } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                  } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                  }
                }
              });
            }

            // 🔥 Evento para manejar fullscreenchange
            document.addEventListener('fullscreenchange', () => {
              if (document.fullscreenElement === element) {
                // En fullscreen
                element.classList.add('fullscreen-active');
                element.style.width = '100%';
                element.style.height = '100%';
                canvas.style.width = '100%';
                canvas.style.height = '100%';

                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;

                scene.clearColor = new BABYLON.Color4(1, 1, 1, 1); // Fondo blanco

                const icon = completeViewButton.querySelector('i');
                if (icon) {
                  icon.classList.remove('fa-expand');
                  icon.classList.add('fa-compress');
                }

                engine.resize();

              } else {
                // Salimos de fullscreen
                element.classList.remove('fullscreen-active');
                element.style.width = '';
                element.style.height = '';
                canvas.style.width = '100%';
                canvas.style.height = '500px';

                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;

                scene.clearColor = new BABYLON.Color4(0, 0, 0, 0); // Fondo transparente

                const icon = completeViewButton.querySelector('i');
                  if (icon) {
                    icon.classList.remove('fa-compress');
                    icon.classList.add('fa-expand');
                  }
              }
              setTimeout(()=> {
                engine.resize();
              }, 100);
            });



          } else {
          }

          engine.runRenderLoop(function () {
            scene.render();
          });
        }, null, function (scene, message, exception) {
        });

        window.addEventListener('resize', function () {
          engine.resize();
        });
      });
    }
  };
})(jQuery, Drupal, drupalSettings);