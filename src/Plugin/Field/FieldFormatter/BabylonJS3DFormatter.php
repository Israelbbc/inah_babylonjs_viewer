<?php

namespace Drupal\babylonjs_viewer\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\file\Plugin\Field\FieldFormatter\FileFormatterBase;
use Drupal\file\Entity\File;
use Drupal\media\Entity\Media;
use Drupal\node\Entity\Node;
use Drupal\taxonomy\Entity\Term;
use Drupal\Core\Logger\RfcLogLevel;

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

  $logger = \Drupal::logger('babylonjs_viewer_debug');

  $files = $this->getEntitiesToView($items, $langcode);
  if (empty($files)) {
    $logger->warning('No files found to render.');
    return $elements;
  }

  $file = reset($files);
  $file_url = \Drupal::service('file_url_generator')->generateAbsoluteString($file->getFileUri());
  $logger->notice('Rendering file: @url', ['@url' => $file_url]);

  // Buscar media relacionada con ese archivo.
  $media_storage = \Drupal::entityTypeManager()->getStorage('media');
  $media = NULL;

  foreach (['field_media_file_1', 'field_media_image'] as $field_name) {
    $media_candidates = $media_storage->loadByProperties([
      "$field_name.target_id" => $file->id(),
    ]);
    if (!empty($media_candidates)) {
      $media = reset($media_candidates);
      $logger->notice('Found media ID @id with field @field', [
        '@id' => $media->id(),
        '@field' => $field_name,
      ]);
      break;
    }
  }

  $thumbnail_url = NULL;

  if ($media && $media->hasField('field_media_of') && !$media->get('field_media_of')->isEmpty()) {
    $node = $media->get('field_media_of')->entity;
    $logger->notice('Found node ID @nid from media.', ['@nid' => $node->id()]);

    // Buscar medias relacionadas con ese nodo.
    $related_medias = $media_storage->loadByProperties([
      'field_media_of.target_id' => $node->id(),
    ]);
    $logger->notice('Found @count related medias.', ['@count' => count($related_medias)]);

    foreach ($related_medias as $rel_media) {
      if (!$rel_media->hasField('field_media_use')) {
        continue;
      }

      foreach ($rel_media->get('field_media_use')->referencedEntities() as $term) {
        $label = strtolower($term->label());
        $uri = $term->get('field_external_uri')->value ?? '';

        $logger->info('Checking media use term: @label (URI: @uri)', [
          '@label' => $label,
          '@uri' => $uri,
        ]);

        if ($label === 'thumbnail image' || $uri === 'http://pcdm.org/use#ThumbnailImage') {
          $logger->notice('Found media with Thumbnail use: Media ID @id', ['@id' => $rel_media->id()]);

          $thumb_file = NULL;

          foreach (['field_media_image', 'field_media_file_1'] as $field_check) {
            if ($rel_media->hasField($field_check) && !$rel_media->get($field_check)->isEmpty()) {
              $thumb_file = $rel_media->get($field_check)->entity;
              $logger->notice('Found file in field @field: @fid', [
                '@field' => $field_check,
                '@fid' => $thumb_file ? $thumb_file->id() : 'NULL',
              ]);
              break;
            }
          }

          if ($thumb_file) {
            $thumbnail_url = \Drupal::service('file_url_generator')->generateAbsoluteString($thumb_file->getFileUri());
            $logger->notice('Thumbnail URL resolved: @url', ['@url' => $thumbnail_url]);
          } else {
            $logger->warning('Thumbnail file entity not found.');
          }

          break 2;
        }
      }
    }
  } else {
    $logger->warning('No media or node found from original file.');
  }

  // Adjuntar configuración al render.
  $elements[] = [
    '#theme' => 'babylonjs_formatter',
    '#file_url' => $file_url,
    '#thumbnail_url' => $thumbnail_url,
    '#create_placeholder' => FALSE,
    '#cache' => ['max-age' => 0],
    '#attached' => [
      'library' => [
        'babylonjs_viewer/babylonjs_viewer',
      ],
      'drupalSettings' => [
        'babylonjs_viewer' => [
          'file_url' => $file_url,
          'thumbnail_url' => $thumbnail_url,
        ],
      ],
    ],
  ];

  return $elements;
}
}

