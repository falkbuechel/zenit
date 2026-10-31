@echo off
rem Phase A: Bildmodelle (~38 GB) nach G:\03_AI\Zenit-Downloads\1_Bilder
rem Doppelklick genuegt. Abbruch egal: erneut starten, setzt fort und ueberspringt Fertiges.
setlocal
set "Z=G:\03_AI\Zenit-Downloads\1_Bilder"
set "HF=https://huggingface.co"

call :get "%Z%\diffusion_models\qwen-image-2512-Q4_K_M.gguf"      "%HF%/unsloth/Qwen-Image-2512-GGUF/resolve/main/qwen-image-2512-Q4_K_M.gguf"
call :get "%Z%\diffusion_models\qwen-image-edit-2511-Q4_K_M.gguf" "%HF%/unsloth/Qwen-Image-Edit-2511-GGUF/resolve/main/qwen-image-edit-2511-Q4_K_M.gguf"
call :get "%Z%\text_encoders\qwen_2.5_vl_7b_fp8_scaled.safetensors" "%HF%/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors"
call :get "%Z%\vae\qwen_image_vae.safetensors"                    "%HF%/Comfy-Org/Qwen-Image_ComfyUI/resolve/main/split_files/vae/qwen_image_vae.safetensors"
call :get "%Z%\loras\Qwen-Image-2512-Lightning-8steps-V1.0-bf16.safetensors"      "%HF%/lightx2v/Qwen-Image-2512-Lightning/resolve/main/Qwen-Image-2512-Lightning-8steps-V1.0-bf16.safetensors"
call :get "%Z%\loras\Qwen-Image-Edit-2511-Lightning-8steps-V1.0-bf16.safetensors" "%HF%/lightx2v/Qwen-Image-Edit-2511-Lightning/resolve/main/Qwen-Image-Edit-2511-Lightning-8steps-V1.0-bf16.safetensors"
call :get "%Z%\background_removal\birefnet.safetensors"           "%HF%/Comfy-Org/BiRefNet/resolve/main/background_removal/birefnet.safetensors"

echo.
echo Fertig. Fehler stehen oben mit "FEHLER".
pause
exit /b

:get
echo.
echo === %~nx1
curl.exe -L -C - --retry 5 --retry-delay 10 --fail -o "%~1" "%~2"
if errorlevel 1 echo FEHLER bei %~nx1 (erneut starten setzt fort)
exit /b
