# ComfyUI-Downloads (Maskottchen-Pipeline)

Sammelordner: `G:\03_AI\Zenit-Downloads` (Unterordner = ComfyUI-Modellordner, später nur verschieben)
ComfyUI Desktop: `G:\03_AI\Comfy-Desktop`, Modelle gemeinsam in `ComfyUI-Shared\models` (noch leer)
Genaue Dateinamen, Größen und Links folgen.

## 1_Bilder (Phase A, ca. 38 GB)
Laden: `download-1-bilder.cmd` (Doppelklick, setzt nach Abbruch fort)

| Ordner | Datei | Quelle (HF) | GB | Lizenz |
|---|---|---|---|---|
| diffusion_models | qwen-image-2512-Q4_K_M.gguf | unsloth/Qwen-Image-2512-GGUF | 13,3 | Apache 2.0 |
| diffusion_models | qwen-image-edit-2511-Q4_K_M.gguf | unsloth/Qwen-Image-Edit-2511-GGUF | 12,8 | Apache 2.0 |
| text_encoders | qwen_2.5_vl_7b_fp8_scaled.safetensors | Comfy-Org/Qwen-Image_ComfyUI | 9,4 | Apache 2.0 |
| vae | qwen_image_vae.safetensors | Comfy-Org/Qwen-Image_ComfyUI | 0,25 | Apache 2.0 |
| loras | Qwen-Image-2512-Lightning-8steps-V1.0-bf16 | lightx2v/Qwen-Image-2512-Lightning | 0,85 | Apache 2.0 |
| loras | Qwen-Image-Edit-2511-Lightning-8steps-V1.0-bf16 | lightx2v/Qwen-Image-Edit-2511-Lightning | 0,85 | Apache 2.0 |
| background_removal | birefnet.safetensors (in ComfyUI eingebaut) | Comfy-Org/BiRefNet | ~0,9 | MIT |

8 statt 4 Schritte: 4-Schritt-LoRA von Edit-2511 gibt Rotstich.
Custom Node: ComfyUI-GGUF (city96, Apache 2.0) über den Manager installieren.

## 2_3D (Phase B, nach der Bildauswahl; vorher Qwen-Image-2512 löschen)
| Ordner | Inhalt | Lizenz | Status |
|---|---|---|---|
| diffusion_models | trellis_2_int8_convrot (5,3 GB) | Comfy-Org/TRELLIS.2 | MIT |
| diffusion_models | pixal3d_int8_convrot (5,6 GB) | Comfy-Org/Pixal3D | MIT |
| vae | trellis_2_shape_vae + texture_vae (2,0 GB, beide nutzen sie) | Comfy-Org/TRELLIS.2 | MIT |
| clip_vision | dino_v3_vit_l (TRELLIS.2) + dino_v3_L_naf (Pixal3D), je 1,2 GB | Comfy-Org | – |
| geometry_estimation | MoGe (Datei laut Workflow-Vorlage, 0,6–0,7 GB) | Comfy-Org/MoGe | MIT / Apache 2.0 |

Beide laufen nativ in ComfyUI (ohne nvdiffrast, keine nicht-kommerziellen Teile). Zusammen ~16 GB.

## 3_custom_nodes
ComfyUI-GGUF, Freistell-Knoten, ComfyUI-Trellis2 (Phase B)

## 4_workflows
Workflow-JSONs aus diesem Ordner
