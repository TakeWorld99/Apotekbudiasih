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
        Schema::create('opname_reports', function (Blueprint $table) {
            $table->id();
            $table->string('report_no')->unique(); // e.g. 'BASO-20260923-W02'
            $table->integer('schedule_id')->nullable();
            $table->string('schedule_title')->nullable();
            $table->integer('week_number')->nullable();
            $table->string('category_names')->nullable();
            $table->string('performed_at')->nullable();
            $table->string('performed_by')->nullable();
            $table->string('approved_by')->nullable();
            $table->integer('total_items_counted')->default(0);
            $table->integer('matched_items_count')->default(0);
            $table->integer('discrepancy_items_count')->default(0);
            $table->decimal('total_variance_value', 14, 2)->default(0);
            $table->string('status')->default('Disetujui Admin');
            $table->text('notes')->nullable();
            $table->jsonb('items')->nullable(); // detail item opname, stok sistem, fisik, variance
            $table->timestamps();

            $table->index('report_no');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('opname_reports');
    }
};
