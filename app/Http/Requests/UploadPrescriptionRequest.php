<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadPrescriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'prescription_image' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'], // Max 5MB
            'patient_name'       => ['required', 'string', 'max:100'],
            'patient_phone'      => ['nullable', 'string', 'max:20'],
            'doctor_name'        => ['nullable', 'string', 'max:100'],
            'notes'              => ['nullable', 'string', 'max:500'],
        ];
    }
}
