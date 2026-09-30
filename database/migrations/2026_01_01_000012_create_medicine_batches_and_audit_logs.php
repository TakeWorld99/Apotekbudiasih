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
        // 1. Tabel medicine_batches (FEFO & BPOM batch compliance)
        Schema::create('medicine_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medicine_id')->constrained('medicines')->onDelete('cascade');
            $table->string('batch_no');
            $table->date('expiry_date');
            $table->integer('stock')->default(0);
            $table->string('supplier_name')->nullable();
            $table->timestamps();

            $table->index(['medicine_id', 'expiry_date']);
            $table->unique(['medicine_id', 'batch_no']);
        });

        // 2. Tabel audit_logs (Security & Pharmaceutical Audit Trail)
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name')->default('Sistem');
            $table->string('user_role')->nullable();
            $table->string('action'); // LOGIN, CREATE_MEDICINE, ADJUST_STOCK, EOD_CLOSE, etc.
            $table->string('entity')->nullable(); // medicines, users, transactions, etc.
            $table->string('entity_id')->nullable();
            $table->jsonb('details')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['action', 'created_at']);
            $table->index(['entity', 'entity_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicine_batches');
        Schema::dropIfExists('audit_logs');
    }
};
