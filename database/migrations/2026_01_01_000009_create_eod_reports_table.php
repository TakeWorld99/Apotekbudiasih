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
        Schema::create('eod_reports', function (Blueprint $table) {
            $table->id();
            $table->string('store_name')->default('Apotek Budi Asih');
            $table->string('employee_nik')->nullable();
            $table->string('employee_name');
            $table->string('employee_role')->nullable();
            $table->string('report_date'); // misal: '2026-09-23' atau '2026-09-01 s/d 2026-09-23'
            $table->string('open_time')->nullable();
            $table->string('close_time')->nullable();
            $table->string('user_update')->nullable();
            $table->string('date_update')->nullable();
            $table->decimal('starting_cash', 14, 2)->default(0);
            $table->decimal('actual_cash_counted', 14, 2)->default(0);
            $table->decimal('deposit_cash', 14, 2)->default(0);
            $table->decimal('petty_expense', 14, 2)->default(0);
            $table->string('petty_expense_note')->nullable();
            $table->decimal('cash_sales', 14, 2)->default(0);
            $table->integer('cash_tx_count')->default(0);
            $table->decimal('target_system_cash', 14, 2)->default(0);
            $table->decimal('cash_discrepancy', 14, 2)->default(0);
            $table->decimal('qris_sales', 14, 2)->default(0);
            $table->integer('qris_tx_count')->default(0);
            $table->decimal('transfer_sales', 14, 2)->default(0);
            $table->integer('transfer_tx_count')->default(0);
            $table->decimal('debit_sales', 14, 2)->default(0);
            $table->integer('debit_tx_count')->default(0);
            $table->decimal('total_non_cash_sales', 14, 2)->default(0);
            $table->decimal('total_gross_revenue', 14, 2)->default(0);
            $table->decimal('total_discounts', 14, 2)->default(0);
            $table->decimal('total_tuslah_embalase', 14, 2)->default(0);
            $table->decimal('total_cogs', 14, 2)->default(0);
            $table->decimal('gross_profit', 14, 2)->default(0);
            $table->decimal('profit_margin', 6, 2)->default(0);
            $table->integer('total_invoices')->default(0);
            $table->decimal('average_basket', 14, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['report_date', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('eod_reports');
    }
};
