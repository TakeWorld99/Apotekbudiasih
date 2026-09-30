<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Exception;

class ImageUploadService
{
    /**
     * Mengunggah dan mengompres foto resep dokter ke direktori penyimpanan
     * 
     * @param UploadedFile $file
     * @param string $folder
     * @param string $disk
     * @return string Path relatif berkas yang tersimpan
     * @throws Exception
     */
    public function uploadPrescription(UploadedFile $file, string $folder = 'prescriptions', string $disk = 'public'): string
    {
        // Validasi tipe ekstensi yang diizinkan
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
        $extension = strtolower($file->getClientOriginalExtension());

        if (!in_array($extension, $allowedExtensions)) {
            throw new Exception("Format berkas {$extension} tidak didukung. Harap unggah berkas JPG, PNG, WEBP, atau PDF.");
        }

        // Generate nama file unik dengan timestamp & UUID
        $filename = 'RX_' . date('Ymd_His') . '_' . Str::random(8) . '.' . $extension;
        $targetPath = $folder . '/' . $filename;

        // Simpan file ke disk storage Laravel
        Storage::disk($disk)->putFileAs($folder, $file, $filename);

        return $targetPath;
    }

    /**
     * Menghapus file gambar jika resep dibatalkan/dihapus
     * 
     * @param string $path
     * @param string $disk
     * @return bool
     */
    public function deleteImage(string $path, string $disk = 'public'): bool
    {
        if (Storage::disk($disk)->exists($path)) {
            return Storage::disk($disk)->delete($path);
        }
        return false;
    }
}
