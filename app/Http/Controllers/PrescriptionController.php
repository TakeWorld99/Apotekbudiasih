<?php

namespace App\Http\Controllers;

use App\Models\Prescription;
use App\Services\ImageUploadService;
use App\Http\Requests\UploadPrescriptionRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PrescriptionController extends Controller
{
    protected ImageUploadService $uploadService;

    public function __construct(ImageUploadService $uploadService)
    {
        $this->uploadService = $uploadService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Prescription::with(['user', 'verifier']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->user() && $request->user()->role === 'Pelanggan') {
            $query->where('user_id', $request->user()->id);
        }

        $prescriptions = $query->orderBy('created_at', 'desc')->paginate($request->input('per_page', 15));

        return response()->json($prescriptions);
    }

    public function store(UploadPrescriptionRequest $request): JsonResponse
    {
        $imagePath = $this->uploadService->uploadPrescription(
            $request->file('prescription_image')
        );

        $prescription = Prescription::create([
            'user_id'       => auth()->id() ?? 1,
            'patient_name'  => $request->input('patient_name'),
            'patient_phone' => $request->input('patient_phone'),
            'doctor_name'   => $request->input('doctor_name'),
            'image_path'    => $imagePath,
            'status'        => 'Pending',
            'notes'         => $request->input('notes'),
        ]);

        return response()->json([
            'message'      => 'Resep dokter berhasil diunggah dan menunggu verifikasi Apoteker',
            'prescription' => $prescription->load('user'),
        ], 201);
    }

    public function show(Prescription $prescription): JsonResponse
    {
        return response()->json($prescription->load(['user', 'verifier', 'transaction']));
    }

    public function verify(Request $request, Prescription $prescription): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:Verified,Rejected,Processed',
            'notes'  => 'nullable|string|max:500',
        ]);

        $prescription->update([
            'status'      => $request->input('status'),
            'notes'       => $request->input('notes') ?? $prescription->notes,
            'verified_by' => auth()->id(),
            'verified_at' => now(),
        ]);

        return response()->json([
            'message'      => "Status resep berhasil diubah menjadi: {$prescription->status}",
            'prescription' => $prescription->fresh(['user', 'verifier']),
        ]);
    }
}
