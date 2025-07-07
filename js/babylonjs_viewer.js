(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.babylonjsViewer = {
    attach: function (context, settings) {
      once('babylonjs-viewer', '.babylonjs-viewer', context).forEach(function (element) {
        const fileUrl = drupalSettings?.babylonjs_viewer?.file_url;
        if (!fileUrl) return;

        const canvas = element.querySelector('canvas');
        if (!canvas) return;

        const engine = new BABYLON.Engine(canvas, true, {
          preserveDrawingBuffer: true,
          stencil: true,
          alpha: true
        });

        BABYLON.DefaultLoadingScreen.prototype.displayLoadingUI = function () {
          if (this._isLoading) return;
          this._isLoading = true;

          const loadingDiv = document.createElement("div");
          loadingDiv.id = "customLoadingScreenDiv";
          loadingDiv.style.position = 'absolute';
          loadingDiv.style.top = `${canvas.offsetTop}px`;
          loadingDiv.style.left = `${canvas.offsetLeft}px`;
          loadingDiv.style.width = `${canvas.clientWidth}px`;
          loadingDiv.style.height = `${canvas.clientHeight}px`;
          loadingDiv.style.backgroundColor = 'white';
          loadingDiv.style.zIndex = '1000';
          loadingDiv.style.display = 'flex';
          loadingDiv.style.flexDirection = 'column';
          loadingDiv.style.alignItems = 'center';
          loadingDiv.style.justifyContent = 'center';
          loadingDiv.style.color = '#ccc';
          loadingDiv.style.textShadow = '1px 1px 3px rgba(0, 0, 0, 0.5)';
          loadingDiv.style.fontFamily = 'Arial, sans-serif';

          const settings = drupalSettings.babylonjs_viewer || {};
          const thumbnailUrl = settings.thumbnail_url;

          if (thumbnailUrl) {
            const screenWrapper = document.createElement('div');
            screenWrapper.style.position = 'absolute';
            screenWrapper.style.top = '0';
            screenWrapper.style.left = '0';
            screenWrapper.style.width = '100%';
            screenWrapper.style.height = '100%';
            screenWrapper.style.display = 'flex';
            screenWrapper.style.alignItems = 'center';
            screenWrapper.style.justifyContent = 'center';
            screenWrapper.style.zIndex = '0';

            const screen = document.createElement('img');
            screen.id = 'babylonjs-loading-screen';
            screen.src = thumbnailUrl;

            Object.assign(screen.style, {
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                display: 'block',
                // Asegura que tome dimensiones aunque el padre sea flexible
                width: 'auto',
                height: 'auto',
            });
            screenWrapper.appendChild(screen);
            loadingDiv.appendChild(screenWrapper);
          }

          const loadingImage = document.createElement('img');
          loadingImage.alt = 'Cargando...';
          loadingImage.style.width = '125px';
          loadingImage.style.height = '125px';
          loadingImage.style.zIndex = '1';
          loadingImage.style.position = 'relative';
          loadingImage.src = drupalSettings.path.baseUrl + 'sites/default/files/babylonjs_viewer/screen-load.png';
          loadingDiv.appendChild(loadingImage);

          const loadingTextContainer = document.createElement('div');
          loadingTextContainer.style.display = 'flex';
          loadingTextContainer.style.gap = '10px';
          loadingTextContainer.style.marginTop = '20px';
          loadingTextContainer.style.fontSize = '20px';
          loadingTextContainer.style.zIndex = '1';
          loadingTextContainer.style.position = 'relative';

          const loadingLabel = document.createElement('span');
          loadingLabel.textContent = 'CARGANDO';

          const loadingPercent = document.createElement('span');
          loadingPercent.id = 'loadingScreenPercent';
          loadingPercent.textContent = '0%';

          loadingTextContainer.appendChild(loadingLabel);
          loadingTextContainer.appendChild(loadingPercent);
          loadingDiv.appendChild(loadingTextContainer);

          canvas.parentElement.appendChild(loadingDiv);

          engine.hideLoadingUI = () => {
            const div = document.getElementById('customLoadingScreenDiv');
            if (div) div.remove();
          };
        };

        BABYLON.DefaultLoadingScreen.prototype.hideLoadingUI = function () {
          const loadingDiv = document.getElementById('customLoadingScreenDiv');
          if (loadingDiv) loadingDiv.remove();
          this._isLoading = false;
        };

        engine.displayLoadingUI();

        const scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

        BABYLON.SceneLoader.ImportMeshAsync(null, "", fileUrl, scene, function (evt) {
          let loadedPercent = 0;
          if (evt.lengthComputable) {
            loadedPercent = ((evt.loaded * 100) / evt.total).toFixed();
          } else {
            let dlCount = evt.loaded / (1024 * 1024);
            loadedPercent = Math.floor(dlCount * 100.0) / 100.0;
          }

          const percentEl = document.getElementById("loadingScreenPercent");
          if (percentEl) {
            percentEl.textContent = `${loadedPercent}%`;
          }
        }).then(function (result) {
          scene.createDefaultCameraOrLight(true, true, true);

          let activeCamera = scene.cameras.find(cam => cam instanceof BABYLON.ArcRotateCamera);
          if (!activeCamera) return;

          const initialCameraState = {
            alpha: activeCamera.alpha,
            beta: activeCamera.beta,
            radius: activeCamera.radius,
            target: activeCamera.target.clone()
          };

          activeCamera.allowUpsideDown = true;
          activeCamera.lowerBetaLimit = -Infinity;
          activeCamera.upperBetaLimit = Infinity;
          activeCamera.lowerRadiusLimit = initialCameraState.radius * -10;
          activeCamera.upperRadiusLimit = initialCameraState.radius * 10;

          const directionalLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(0, 1, 0), scene);
          directionalLight.position = new BABYLON.Vector3(5, 5, 5);
          directionalLight.intensity = 2.5;

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

          const controlsContainer = element.querySelector('.viewer-controls');
          const completeViewButton = controlsContainer?.querySelector('#completeView');

          // 🔧 Asegura que esta función esté disponible donde se necesita
          function updateFullscreenIcon(isFullscreen) {
            const icon = document.getElementById('completeViewIcon'); 
            if (!icon) {
              return;
            }
            if (isFullscreen) {
              icon.classList.remove('fa-expand');
              icon.classList.add('fa-compress');
            } else {
              icon.classList.remove('fa-compress');
              icon.classList.add('fa-expand');   
            }
          }

          if (controlsContainer) {
            const rotateStep = 0.5;
            const zoomStep = initialCameraState.radius * 0.2;

            controlsContainer.querySelector('#resetView')?.addEventListener('click', () => {
              Object.assign(activeCamera, initialCameraState);
              activeCamera.target = initialCameraState.target.clone();
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

            // 🧠 Lógica para fullscreen
            const isIos = /iP(ad|hone|od)/.test(navigator.userAgent);
            if (completeViewButton) {
              completeViewButton.addEventListener('click', () => {
                const isFullscreen = document.fullscreenElement === element;

                if (isIos && !element.requestFullscreen) {
                  const isActive = element.classList.contains('fullscreen-active');
                  if (!isActive) {
                    element.classList.add('fullscreen-active');
                    Object.assign(element.style, {
                      position: 'fixed',
                      top: '0', left: '0',
                      width: '100vw', height: '100vh',
                      zIndex: '9999', backgroundColor: '#ffffff'
                    });
                    Object.assign(canvas.style, {
                      width: '100%', height: '100%'
                    });
                    canvas.width = canvas.clientWidth;
                    canvas.height = canvas.clientHeight;
                    scene.clearColor = new BABYLON.Color4(1, 1, 1, 1);
                    updateFullscreenIcon(true);
                  } else {
                    element.classList.remove('fullscreen-active');
                    element.removeAttribute('style');
                    canvas.style.width = '100%';
                    canvas.style.height = '500px';
                    canvas.width = canvas.clientWidth;
                    canvas.height = canvas.clientHeight;
                    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
                    updateFullscreenIcon(false);
                  }
                  setTimeout(() => engine.resize(), 100);
                } else {
                  if (!isFullscreen) {
                    element.requestFullscreen?.() || element.webkitRequestFullscreen?.() || element.msRequestFullscreen?.();
                  } else {
                    document.exitFullscreen?.() || document.webkitExitFullscreen?.() || document.msExitFullscreen?.();
                  }
                }
              });

              document.addEventListener('fullscreenchange', () => {
                const isFullscreen = document.fullscreenElement === element;
                if (isFullscreen) {
                  element.classList.add('fullscreen-active');
                  Object.assign(element.style, {
                    width: '100%', height: '100%'
                  });
                  Object.assign(canvas.style, {
                    width: '100%', height: '100%'
                  });
                  canvas.width = canvas.clientWidth;
                  canvas.height = canvas.clientHeight;
                  scene.clearColor = new BABYLON.Color4(1, 1, 1, 1);
                } else {
                  element.classList.remove('fullscreen-active');
                  element.removeAttribute('style');
                  canvas.style.width = '100%';
                  canvas.style.height = '500px';
                  canvas.width = canvas.clientWidth;
                  canvas.height = canvas.clientHeight;
                  scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
                }
                updateFullscreenIcon(isFullscreen);
                setTimeout(() => engine.resize(), 100);
              });
            }
          }

          engine.hideLoadingUI();
          engine.runRenderLoop(() => scene.render());
        });

        window.addEventListener('resize', () => {
          engine.resize();
        });
      });
    }
  };
})(jQuery, Drupal, drupalSettings);
