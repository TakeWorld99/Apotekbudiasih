<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ProcurementController;
use App\Http\Controllers\BatchController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OpnameController;

/*
|--------------------------------------------------------------------------
| API Routes - Apotek Budi Asih (Clinical Precision Backend)
|--------------------------------------------------------------------------
*/

// Public Authentication & Password Recovery
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/forgot-password/reset', [AuthController::class, 'resetPassword']);

// User Management (Direct PostgreSQL sync)
Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::post('/users/update', [UserController::class, 'update']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::post('/users/delete', [UserController::class, 'destroy']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);

Route::middleware('auth:sanctum')->group(function () {
    // 1. Current User & Logout
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // 2. Modul Kasir POS & Transaksi (Kasir, Apoteker, Admin)
    Route::middleware('role:Admin,Apoteker,Kasir')->group(function () {
        Route::get('/transactions', [TransactionController::class, 'index']);
        Route::post('/transactions', [TransactionController::class, 'store']);
        Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);

        // Cashier Shift Management
        Route::get('/shifts/current', [ShiftController::class, 'current']);
        Route::post('/shifts/open', [ShiftController::class, 'open']);
        Route::post('/shifts/close', [ShiftController::class, 'close']);
    });

    // 3. Modul Katalog & Stok Obat
    Route::get('/medicines', [MedicineController::class, 'index']);
    Route::get('/medicines/{medicine}', [MedicineController::class, 'show']);

    Route::middleware('role:Admin,Apoteker')->group(function () {
        Route::post('/medicines', [MedicineController::class, 'store']);
        Route::put('/medicines/{medicine}', [MedicineController::class, 'update']);
        Route::delete('/medicines/{medicine}', [MedicineController::class, 'destroy']);
        Route::post('/medicines/{medicine}/adjust-stock', [MedicineController::class, 'adjustStock']);
    });

    // 4. Modul Inventaris FEFO & Batch
    Route::middleware('role:Admin,Apoteker')->group(function () {
        Route::get('/batches', [BatchController::class, 'index']);
        Route::post('/batches/dispose', [BatchController::class, 'dispose']);
    });

    // 5. Modul Pengadaan PBF & Surat Pesanan
    Route::middleware('role:Admin,Apoteker')->group(function () {
        Route::get('/procurements/suppliers', [ProcurementController::class, 'suppliers']);
        Route::post('/procurements/orders', [ProcurementController::class, 'createOrder']);
        Route::post('/procurements/receive', [ProcurementController::class, 'receiveOrder']);
    });

    // 6. Modul Resep Dokter & Racikan
    Route::get('/prescriptions', [PrescriptionController::class, 'index']);
    Route::post('/prescriptions', [PrescriptionController::class, 'store']);
    Route::get('/prescriptions/{prescription}', [PrescriptionController::class, 'show']);

    Route::middleware('role:Admin,Apoteker')->group(function () {
        Route::patch('/prescriptions/{prescription}/verify', [PrescriptionController::class, 'verify']);
    });

    // 7. Modul Laporan & Analitik Finansial
    Route::middleware('role:Admin,Apoteker')->group(function () {
        Route::get('/reports/sales-summary', [ReportController::class, 'salesSummary']);
        Route::get('/reports/inventory-health', [ReportController::class, 'inventoryHealth']);
        Route::get('/reports/export-excel', [ReportController::class, 'exportExcel']);
    });

    // 8. Modul Stock Opname & Berita Acara (BASO)
    Route::middleware('role:Admin,Apoteker,Owner')->group(function () {
        Route::post('/opname/approve', [OpnameController::class, 'approve']);
    });
    Route::middleware('role:Owner,Admin')->group(function () {
        Route::get('/opname-reports', [OpnameController::class, 'index']);
        Route::delete('/opname-reports/{id}', [OpnameController::class, 'destroy']);
        Route::post('/opname/delete', [OpnameController::class, 'destroy']);
        Route::post('/opname/clear-all', [OpnameController::class, 'clearAll']);
    });
});
