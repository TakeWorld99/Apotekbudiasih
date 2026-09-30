<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stock_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medicine_id')->constrained('medicines')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('type', ['In', 'Out', 'Adjust'])->default('Adjust');
            $table->integer('qty'); // positif jika bertambah, negatif jika berkurang
            $table->integer('current_stock')->default(0); // snapshot sisa stok setelah mutasi
            $table->string('reason')->nullable(); // Penjualan Kasir, Penerimaan Supplier, Rusak/Expired, Penyesuaian Fisik (Opname)
            $table->string('reference_id')->nullable(); // misal INV-20260101-001
            $table->timestamp('created_at')->useCurrent();

            $table->index(['medicine_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_logs');
    }
};
