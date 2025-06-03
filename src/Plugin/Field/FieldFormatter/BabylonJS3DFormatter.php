<?php

namespace Drupal\babylonjs_viewer\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\file\Plugin\Field\FieldFormatter\FileFormatterBase;

/**
 * Field formatter for BabylonJS 3D models.
 *
 * @FieldFormatter(
 *   id = "babylonjs_3d_model",
 *   module = "babylonjs_viewer",
 *   label = @Translation("INAH BabylonJS 3D Model"),
 *   description = @Translation("Render a 3D model file (.glb, .gltf) using BabylonJS."),
 *   field_types = {
 *     "file"
 *   }
 * )
 */
class BabylonJS3DFormatter extends FileFormatterBase {

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $elements = [];

    $files = $this->getEntitiesToView($items, $langcode);
    if (empty($files)) {
      return $elements;
    }

    // Tomar el primer archivo disponible (si hay varios, renderizamos solo uno).
    $file = reset($files);
    $file_url = \Drupal::service('file_url_generator')->generateAbsoluteString($file->getFileUri());

    $elements[] = [
      '#theme' => 'babylonjs_formatter',
      '#file_url' => $file_url,
      '#create_placeholder' => FALSE,
      '#cache' => ['max-age' => 0],
      '#attached' => [
        'library' => [
          'babylonjs_viewer/babylonjs_viewer',
        ],
        'drupalSettings' => [
          'babylonjs_viewer' => [
            'file_url' => $file_url,
          ],
        ],
      ],
    ];

    return $elements;
  }
}

